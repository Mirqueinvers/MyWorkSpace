import { useEffect, useMemo, useRef, useState } from 'react'
import bones from '../data/bones.json'

function buildSvgGroupMap(items) {
  const groupMap = new Map()

  for (const bone of items) {
    for (const svgGroupId of bone.svg_group_ids) {
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

  if (!element.dataset.atlasOriginalFill) {
    element.dataset.atlasOriginalFill = element.style.fill || ''
  }

  if (!element.dataset.atlasOriginalStroke) {
    element.dataset.atlasOriginalStroke = element.style.stroke || ''
  }

  if (!element.dataset.atlasOriginalStrokeWidth) {
    element.dataset.atlasOriginalStrokeWidth = element.style.strokeWidth || ''
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

    if (state === 'selected') {
      element.style.setProperty('fill', '#fdba74', 'important')
      element.style.setProperty('stroke', '#c2410c', 'important')
      element.style.setProperty('stroke-width', '1.3', 'important')
      element.style.setProperty('filter', 'brightness(1.04)', 'important')
      continue
    }

    if (state === 'hover') {
      element.style.setProperty('fill', '#fde68a', 'important')
      element.style.setProperty('stroke', '#0f766e', 'important')
      element.style.setProperty('stroke-width', '1.15', 'important')
      element.style.setProperty('filter', 'brightness(1.03)', 'important')
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

export function SkeletonAtlas({
  svgMarkup,
  onBoneHover,
  onBoneLeave,
  onBoneSelect,
}) {
  const mountRef = useRef(null)
  const svgRef = useRef(null)
  const boneElementsRef = useRef(new Map())
  const hoveredBoneIdRef = useRef(null)

  const [hoveredBoneId, setHoveredBoneId] = useState(null)
  const [selectedBoneId, setSelectedBoneId] = useState(null)
  const [resolvedBonesCount, setResolvedBonesCount] = useState(0)

  const svgGroupMap = useMemo(() => buildSvgGroupMap(bones), [])
  const boneMap = useMemo(() => buildBoneMap(bones), [])

  useEffect(() => {
    const mountElement = mountRef.current

    boneElementsRef.current = new Map()
    svgRef.current = null
    hoveredBoneIdRef.current = null
    setHoveredBoneId(null)
    setSelectedBoneId(null)
    setResolvedBonesCount(0)

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
        storeOriginalVisualState(target)
        target.classList.add('atlas-bone-target', 'atlas-bone-shape')
        target.dataset.bonePrimaryId = primaryBone.id
        target.dataset.boneSvgGroupId = svgGroupId

        const hitShape = createHitShape(target)
        if (!hitShape) {
          continue
        }

        hitShape.dataset.bonePrimaryId = primaryBone.id
        hitShape.dataset.boneSvgGroupId = svgGroupId
        overlayLayer.appendChild(hitShape)
      }
    }

    svgElement.appendChild(overlayLayer)
    setResolvedBonesCount(resolvedBoneIds.size)

    const handlePointerMove = (event) => {
      const boneNode = findBoneNode(event.target, svgElement)

      if (!boneNode) {
        if (hoveredBoneIdRef.current) {
          const previousBoneId = hoveredBoneIdRef.current
          hoveredBoneIdRef.current = null
          setHoveredBoneId(null)

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
        return
      }

      const previousBoneId = hoveredBoneIdRef.current
      hoveredBoneIdRef.current = null
      setHoveredBoneId(null)

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
  }, [hoveredBoneId, selectedBoneId])

  return (
    <div className="atlas-skeleton-shell">
      <div className="atlas-skeleton-svg" aria-label={'\u0410\u0442\u043b\u0430\u0441 \u0441\u043a\u0435\u043b\u0435\u0442\u0430'}>
        <div ref={mountRef} className="atlas-skeleton-mount" />
      </div>
    </div>
  )
}

export default SkeletonAtlas
