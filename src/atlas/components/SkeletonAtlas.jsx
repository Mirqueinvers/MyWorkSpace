import { useEffect, useMemo, useRef, useState } from 'react'
import bones from '../data/bones.json'

function getSvgGroupIdsForView(bone, view) {
  if (view === 'back') {
    return bone.svg_group_ids_back ?? []
  }

  return bone.svg_group_ids ?? []
}

function getBoneMappingPriority(bone) {
  if (bone.id === 'vertebral_column') {
    return 100
  }

  return 0
}

function buildSvgGroupMap(items, view) {
  const groupMap = new Map()
  const sortedItems = [...items].sort(
    (left, right) => getBoneMappingPriority(left) - getBoneMappingPriority(right),
  )

  for (const bone of sortedItems) {
    for (const svgGroupId of getSvgGroupIdsForView(bone, view)) {
      if (!svgGroupId) {
        continue
      }

      const mappedBones = groupMap.get(svgGroupId) ?? []
      mappedBones.push(bone)
      groupMap.set(svgGroupId, mappedBones)
    }
  }

  return groupMap
}

function buildBoneMap(items) {
  const boneMap = new Map()

  for (const bone of items) {
    boneMap.set(bone.id, bone)
  }

  return boneMap
}

function getDrawableTargets(svgNode) {
  if (!svgNode) {
    return []
  }

  const isDrawable =
    svgNode.matches?.('path, polygon, polyline, ellipse, circle, rect') ?? false

  const descendants = Array.from(
    svgNode.querySelectorAll('path, polygon, polyline, ellipse, circle, rect'),
  )

  return Array.from(new Set(isDrawable ? [svgNode, ...descendants] : descendants))
}

function storeOriginalVisualState(element) {
  if (!(element instanceof Element)) {
    return
  }

  const originalFillValue =
    element.style.fill || element.getAttribute('fill') || ''

  if (!element.dataset.atlasOriginalFill) {
    element.dataset.atlasOriginalFill = originalFillValue
  }

  if (!element.dataset.atlasOriginalStroke) {
    element.dataset.atlasOriginalStroke =
      element.style.stroke || element.getAttribute('stroke') || ''
  }

  if (!element.dataset.atlasOriginalStrokeWidth) {
    element.dataset.atlasOriginalStrokeWidth =
      element.style.strokeWidth || element.getAttribute('stroke-width') || ''
  }

  if (!element.dataset.atlasOriginalFilter) {
    element.dataset.atlasOriginalFilter = element.style.filter || ''
  }

  if (!element.dataset.atlasOriginalOpacity) {
    element.dataset.atlasOriginalOpacity = element.style.opacity || ''
  }
}

function restoreOriginalVisualState(element) {
  if (!(element instanceof Element)) {
    return
  }

  const restoreOrRemove = (property, value) => {
    if (value) {
      element.style.setProperty(property, value)
      return
    }

    element.style.removeProperty(property)
  }

  restoreOrRemove('fill', element.dataset.atlasOriginalFill || '')
  restoreOrRemove('stroke', element.dataset.atlasOriginalStroke || '')
  restoreOrRemove('stroke-width', element.dataset.atlasOriginalStrokeWidth || '')
  restoreOrRemove('filter', element.dataset.atlasOriginalFilter || '')
  restoreOrRemove('opacity', element.dataset.atlasOriginalOpacity || '')
}

function applyBoneVisualState(elements, state) {
  for (const element of elements) {
    restoreOriginalVisualState(element)
    const hasFill =
      (element.dataset.atlasOriginalFill || '').trim().toLowerCase() !== 'none'

    if (state === 'muted') {
      element.style.setProperty('opacity', '0.22', 'important')
      element.style.setProperty('filter', 'saturate(0.35)', 'important')
      continue
    }

    if (state === 'selected') {
      if (hasFill) {
        element.style.setProperty('fill', '#fdba74', 'important')
      }
      element.style.setProperty('stroke', '#c2410c', 'important')
      element.style.setProperty('stroke-width', '1.3', 'important')
      element.style.setProperty('filter', 'brightness(1.04)', 'important')
      element.style.setProperty('opacity', '1', 'important')
      continue
    }

    if (state === 'hover') {
      if (hasFill) {
        element.style.setProperty('fill', '#fde68a', 'important')
      }
      element.style.setProperty('stroke', '#0f766e', 'important')
      element.style.setProperty('stroke-width', '1.15', 'important')
      element.style.setProperty('filter', 'brightness(1.03)', 'important')
      element.style.setProperty('opacity', '1', 'important')
    }
  }
}

function createHitShape(sourceElement) {
  if (!(sourceElement instanceof Element)) {
    return null
  }

  const hitShape = sourceElement.cloneNode(false)

  hitShape.removeAttribute('id')
  hitShape.removeAttribute('class')
  hitShape.removeAttribute('style')
  hitShape.classList.add('atlas-bone-hit-shape')

  const tagName = sourceElement.tagName.toLowerCase()

  hitShape.setAttribute('fill', '#ffffff')
  hitShape.setAttribute('fill-opacity', '0')
  hitShape.setAttribute('stroke', '#ffffff')
  hitShape.setAttribute('stroke-opacity', '0')
  hitShape.setAttribute('opacity', '0')
  hitShape.setAttribute('pointer-events', 'all')

  if (tagName === 'path' || tagName === 'polyline' || tagName === 'polygon') {
    hitShape.setAttribute('stroke-width', '16')
    hitShape.setAttribute('stroke-linecap', 'round')
    hitShape.setAttribute('stroke-linejoin', 'round')
    hitShape.setAttribute('vector-effect', 'non-scaling-stroke')
  }

  return hitShape
}

function findBoneNode(startNode, stopNode) {
  let currentNode = startNode

  while (currentNode && currentNode !== stopNode) {
    if (currentNode instanceof Element && currentNode.dataset?.bonePrimaryId) {
      return currentNode
    }

    currentNode = currentNode.parentNode
  }

  return null
}

function getBoneDisplayName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_la : bone.name_ru
}

function getBoneSecondaryName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_ru : bone.name_la
}

export function SkeletonAtlas({
  view = 'front',
  svgMarkup,
  activeGroup = 'all',
  displayLanguage = 'ru',
  selectedBoneId: controlledSelectedBoneId = null,
  onBoneHover,
  onBoneLeave,
  onBoneSelect,
}) {
  const shellRef = useRef(null)
  const mountRef = useRef(null)
  const svgRef = useRef(null)
  const boneElementsRef = useRef(new Map())
  const hoveredBoneIdRef = useRef(null)

  const [hoveredBoneId, setHoveredBoneId] = useState(null)
  const [selectedBoneId, setSelectedBoneId] = useState(null)
  const [resolvedBonesCount, setResolvedBonesCount] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState(null)

  const svgGroupMap = useMemo(() => buildSvgGroupMap(bones, view), [view])
  const boneMap = useMemo(() => buildBoneMap(bones), [])
  const hoveredBone = useMemo(
    () => (hoveredBoneId ? boneMap.get(hoveredBoneId) ?? null : null),
    [boneMap, hoveredBoneId],
  )

  useEffect(() => {
    const mountElement = mountRef.current

    boneElementsRef.current = new Map()
    svgRef.current = null
    hoveredBoneIdRef.current = null
    setHoveredBoneId(null)
    setResolvedBonesCount(0)
    setTooltipPosition(null)

    if (!mountElement) {
      return undefined
    }

    mountElement.innerHTML = ''

    const parser = new DOMParser()
    const parsedDocument = parser.parseFromString(svgMarkup, 'image/svg+xml')
    const parsedSvg = parsedDocument.documentElement

    if (!parsedSvg || parsedSvg.tagName.toLowerCase() !== 'svg') {
      return undefined
    }

    const svgElement = document.importNode(parsedSvg, true)
    svgElement.classList.add('atlas-svg-root')
    mountElement.appendChild(svgElement)
    svgRef.current = svgElement

    const resolvedBoneIds = new Set()
    const overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    overlayLayer.setAttribute('data-atlas-hit-layer', 'true')
    overlayLayer.setAttribute('pointer-events', 'all')
    overlayLayer.classList.add('atlas-hit-layer')

    for (const [svgGroupId, mappedBones] of svgGroupMap.entries()) {
      const svgNode = svgElement.querySelector(`#${CSS.escape(svgGroupId)}`)

      if (!svgNode) {
        continue
      }

      const primaryBone = mappedBones[0]
      const drawableTargets = getDrawableTargets(svgNode)

      if (drawableTargets.length === 0) {
        continue
      }

      svgNode.dataset.bonePrimaryId = primaryBone.id
      svgNode.dataset.boneSvgGroupId = svgGroupId
      svgNode.classList.add('atlas-bone-target')

      for (const bone of mappedBones) {
        const storedElements = boneElementsRef.current.get(bone.id) ?? []
        storedElements.push(...drawableTargets)
        boneElementsRef.current.set(
          bone.id,
          Array.from(new Set(storedElements)),
        )
        resolvedBoneIds.add(bone.id)
      }

      for (const target of drawableTargets) {
        const existingBoneId = target.dataset.bonePrimaryId || null
        const isOwnedByAnotherBone =
          existingBoneId && existingBoneId !== primaryBone.id

        storeOriginalVisualState(target)
        target.classList.add('atlas-bone-target', 'atlas-bone-shape')
        if (!target.dataset.bonePrimaryId) {
          target.dataset.bonePrimaryId = primaryBone.id
          target.dataset.boneSvgGroupId = svgGroupId
        }

        if (isOwnedByAnotherBone) {
          continue
        }

        const hitShape = createHitShape(target)
        if (!hitShape) {
          continue
        }

        if (!hitShape.dataset.bonePrimaryId) {
          hitShape.dataset.bonePrimaryId = primaryBone.id
          hitShape.dataset.boneSvgGroupId = svgGroupId
        }
        overlayLayer.appendChild(hitShape)
      }
    }

    svgElement.appendChild(overlayLayer)
    setResolvedBonesCount(resolvedBoneIds.size)

    const handlePointerMove = (event) => {
      const boneNode = findBoneNode(event.target, svgElement)

      if (shellRef.current) {
        const shellRect = shellRef.current.getBoundingClientRect()
        setTooltipPosition({
          x: event.clientX - shellRect.left + 14,
          y: event.clientY - shellRect.top + 14,
        })
      }

      if (!boneNode) {
        if (hoveredBoneIdRef.current) {
          const previousBoneId = hoveredBoneIdRef.current
          hoveredBoneIdRef.current = null
          setHoveredBoneId(null)
          setTooltipPosition(null)

          const previousBone = boneMap.get(previousBoneId)
          if (previousBone && typeof onBoneLeave === 'function') {
            onBoneLeave(previousBone.id, {
              boneId: previousBone.id,
              primaryBone: previousBone,
              bones: [previousBone],
              svgGroupId: '',
              element: svgElement,
            })
          }
        }

        return
      }

      const nextBoneId = boneNode.dataset.bonePrimaryId

      if (!nextBoneId || nextBoneId === hoveredBoneIdRef.current) {
        return
      }

      hoveredBoneIdRef.current = nextBoneId
      setHoveredBoneId(nextBoneId)

      const nextBone = boneMap.get(nextBoneId)
      if (nextBone && typeof onBoneHover === 'function') {
        onBoneHover(nextBoneId, {
          boneId: nextBoneId,
          primaryBone: nextBone,
          bones: [nextBone],
          svgGroupId: boneNode.dataset.boneSvgGroupId ?? '',
          element: boneNode,
        })
      }
    }

    const handlePointerLeave = () => {
      if (!hoveredBoneIdRef.current) {
        setTooltipPosition(null)
        return
      }

      const previousBoneId = hoveredBoneIdRef.current
      hoveredBoneIdRef.current = null
      setHoveredBoneId(null)
      setTooltipPosition(null)

      const previousBone = boneMap.get(previousBoneId)
      if (previousBone && typeof onBoneLeave === 'function') {
        onBoneLeave(previousBone.id, {
          boneId: previousBone.id,
          primaryBone: previousBone,
          bones: [previousBone],
          svgGroupId: '',
          element: svgElement,
        })
      }
    }

    const handleClick = (event) => {
      const boneNode = findBoneNode(event.target, svgElement)

      if (!boneNode) {
        return
      }

      const nextBoneId = boneNode.dataset.bonePrimaryId
      if (!nextBoneId) {
        return
      }

      const nextBone = boneMap.get(nextBoneId)
      if (!nextBone) {
        return
      }

      hoveredBoneIdRef.current = nextBoneId
      setHoveredBoneId(nextBoneId)
      setSelectedBoneId(nextBoneId)

      if (typeof onBoneSelect === 'function') {
        onBoneSelect(nextBoneId, {
          boneId: nextBoneId,
          primaryBone: nextBone,
          bones: [nextBone],
          svgGroupId: boneNode.dataset.boneSvgGroupId ?? '',
          element: boneNode,
        })
      }
    }

    svgElement.addEventListener('pointermove', handlePointerMove)
    svgElement.addEventListener('pointerleave', handlePointerLeave)
    svgElement.addEventListener('click', handleClick)

    return () => {
      svgElement.removeEventListener('pointermove', handlePointerMove)
      svgElement.removeEventListener('pointerleave', handlePointerLeave)
      svgElement.removeEventListener('click', handleClick)
      mountElement.innerHTML = ''
      boneElementsRef.current = new Map()
      svgRef.current = null
      hoveredBoneIdRef.current = null
    }
  }, [boneMap, onBoneHover, onBoneLeave, onBoneSelect, svgGroupMap, svgMarkup])

  useEffect(() => {
    for (const elements of boneElementsRef.current.values()) {
      applyBoneVisualState(elements, null)
    }

    if (activeGroup !== 'all') {
      for (const [boneId, elements] of boneElementsRef.current.entries()) {
        const bone = boneMap.get(boneId)
        if (!bone || bone.group === activeGroup) {
          continue
        }

        applyBoneVisualState(elements, 'muted')
      }
    }

    if (selectedBoneId) {
      applyBoneVisualState(
        boneElementsRef.current.get(selectedBoneId) ?? [],
        'selected',
      )
    }

    if (hoveredBoneId && hoveredBoneId !== selectedBoneId) {
      applyBoneVisualState(
        boneElementsRef.current.get(hoveredBoneId) ?? [],
        'hover',
      )
    }
  }, [activeGroup, boneMap, hoveredBoneId, resolvedBonesCount, selectedBoneId, view])

  useEffect(() => {
    if (controlledSelectedBoneId === undefined) {
      return
    }

    hoveredBoneIdRef.current = null
    setHoveredBoneId(null)
    setSelectedBoneId(controlledSelectedBoneId ?? null)
  }, [controlledSelectedBoneId])

  return (
    <div ref={shellRef} className="atlas-skeleton-shell">
      <div className="atlas-skeleton-svg" aria-label={'\u0410\u0442\u043b\u0430\u0441 \u0441\u043a\u0435\u043b\u0435\u0442\u0430'}>
        <div ref={mountRef} className="atlas-skeleton-mount" />
      </div>
      {hoveredBone && tooltipPosition ? (
        <div
          className="atlas-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="atlas-tooltip__title">
            {getBoneDisplayName(hoveredBone, displayLanguage)}
          </div>
          {getBoneSecondaryName(hoveredBone, displayLanguage) ? (
            <div className="atlas-tooltip__subtitle">
              {getBoneSecondaryName(hoveredBone, displayLanguage)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default SkeletonAtlas
