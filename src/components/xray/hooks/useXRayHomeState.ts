import { useMemo } from 'react'
import { parseSearchDraft } from '../helpers'
import type { XRaySectionProps } from '../types'
import { useXRayPatientState } from './useXRayPatientState'
import { useXRayStudyDescriptionState } from './useXRayStudyDescriptionState'
import { useXRayStudyState } from './useXRayStudyState'

export function useXRayHomeState(props: XRaySectionProps) {
  const searchDraft = useMemo(() => parseSearchDraft(props.lastSubmittedQuery), [props.lastSubmittedQuery])
  const hasSearch = props.lastSubmittedQuery.trim().length > 0
  const hasResults = props.results.length > 0
  const showAddSuggestion = hasSearch && !props.loading && !hasResults

  const patientState = useXRayPatientState({
    selectedPatient: props.selectedPatient,
    searchDraft,
    onAddPatient: props.onAddPatient,
    onUpdatePatient: props.onUpdatePatient,
    onDeletePatient: props.onDeletePatient,
  })

  const descriptionState = useXRayStudyDescriptionState({
    onUpdateStudy: props.onUpdateStudy,
  })

  const studyState = useXRayStudyState({
    selectedPatient: props.selectedPatient,
    onAddStudy: props.onAddStudy,
    onUpdateStudy: props.onUpdateStudy,
    onDeleteStudy: props.onDeleteStudy,
    onDeletedStudy: descriptionState.handleDeletedStudy,
  })

  return {
    showAddSuggestion,
    ...patientState,
    ...studyState,
    ...descriptionState,
  }
}
