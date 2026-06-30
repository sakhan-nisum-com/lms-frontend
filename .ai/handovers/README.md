# Handover Artifacts

All phase handover documents are stored here. Agents reference these files by exact name.

---

## Artifact Index

| Artifact | Produced By | Consumed By | Phase |
|---|---|---|---|
| `requirements.md` | orchestrator | frontend-builder | Requirement |
| `approved-ui.md` | orchestrator | contract-architect, frontend-builder | UI Freeze |
| `screen-inventory.md` | orchestrator | contract-architect, frontend-builder, schema-designer | UI Freeze |
| `field-definitions.md` | orchestrator | contract-architect, schema-designer | UI Freeze |
| `lovable-export/` | engineer | frontend-builder | UI Generation |
| `claude-enhancement.md` | frontend-builder | frontend-builder (carry forward) | Claude Enhancement |
| `frontend-contracts.md` | frontend-builder | contract-architect | Claude Enhancement |
| `contract-approval.md` | contract-architect | orchestrator, schema-designer, frontend-builder, backend-builder | Contract Finalization |
| `journey-mapping.md` | contract-architect | backend-builder, qa-reviewer | Contract Finalization |
| `endpoint-summary.md` | contract-architect | all agents | Contract Finalization |
| `schema-definition.md` | schema-designer | backend-builder, release-manager | Schema Design |
| `migration-plan.md` | schema-designer | backend-builder, release-manager | Schema Design |
| `state-management.md` | frontend-builder | integration phase | Frontend Completion |
| `endpoint-catalog.md` | backend-builder | integration phase, qa-reviewer | API QA |
| `integration-report.md` | frontend-builder + backend-builder | security-reviewer | Integration |
| `qa-signoff.md` | qa-reviewer | security-reviewer, release-manager | System QA |
| `security-approval.md` | security-reviewer | release-manager | Security Review |
| `release-notes.md` | release-manager | ops team | Release |
| `rollback-plan.md` | release-manager | ops team | Release |
| `deployment-checklist.md` | release-manager | ops team | Release |
| `release-signoff.md` | release-manager | ops team | Release |

---

## Rules

- Use exact file names from the table — agents reference these names directly
- One file per artifact — overwrite when updated, do not add version suffixes
- Files are never deleted mid-project — they carry forward as the audit trail
