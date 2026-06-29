// SCORM 1.2 manifest parser — generic, recursively-nested item tree support

export interface ScormItem {
  identifier: string
  title: string
  identifierref?: string
  href?: string
  children: ScormItem[]
}

export interface ScormResource {
  identifier: string
  href: string
  type?: string
}

export interface ScormOrganization {
  identifier: string
  title: string
  items: ScormItem[]
}

export interface ScormManifest {
  identifier: string
  title: string
  schemaVersion: string
  defaultOrgId: string
  organizations: ScormOrganization[]
  resources: Record<string, ScormResource>
}

// Parse a SCORM 1.2/2004 manifest XML string into a generic structure
export function parseManifest(xmlText: string): ScormManifest {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, "application/xml")

  // Check for XML parse errors
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Failed to parse manifest XML — invalid XML format")
  }

  // Detect schema version (1.2 vs 2004)
  const schemaEl = doc.querySelector("schemaversion")
  const schemaVersion = schemaEl?.textContent?.trim() || ""

  if (schemaVersion && !schemaVersion.match(/^(CAM 1\.3|1\.2|ADL SCORM)/i)) {
    if (schemaVersion.toLowerCase().includes("2004")) {
      throw new Error("SCORM 2004 is not yet supported — please use a SCORM 1.2 package")
    }
  }

  // Extract manifest identifier and title
  const manifestEl = doc.documentElement
  const manifestId = manifestEl.getAttribute("identifier") || `manifest-${Date.now()}`
  const metadataEl = doc.querySelector("metadata")
  const titleEl = metadataEl?.querySelector("title") || doc.querySelector("organizations > organization > title")
  const title = titleEl?.textContent?.trim() || "Untitled SCORM Course"

  // Parse resources (resource → href mapping)
  const resourcesMap: Record<string, ScormResource> = {}
  const resourcesEl = doc.querySelector("resources")
  if (resourcesEl) {
    resourcesEl.querySelectorAll("resource").forEach((el) => {
      const id = el.getAttribute("identifier") || ""
      const href = el.getAttribute("href") || ""
      if (id) {
        resourcesMap[id] = { identifier: id, href }
      }
    })
  }

  // Parse organizations (recursive item tree)
  const organizationsEl = doc.querySelector("organizations")
  const defaultOrgId = organizationsEl?.getAttribute("default") || ""

  const organizations: ScormOrganization[] = []
  if (organizationsEl) {
    organizationsEl.querySelectorAll("organization").forEach((orgEl) => {
      const orgId = orgEl.getAttribute("identifier") || ""
      const orgTitle = orgEl.querySelector("title")?.textContent?.trim() || title
      const items = parseItems(orgEl, resourcesMap)
      organizations.push({ identifier: orgId, title: orgTitle, items })
    })
  }

  return {
    identifier: manifestId,
    title,
    schemaVersion,
    defaultOrgId,
    organizations,
    resources: resourcesMap,
  }
}

// Recursively parse <item> elements (SCORM allows arbitrary nesting depth)
function parseItems(parentEl: Element, resourcesMap: Record<string, ScormResource>): ScormItem[] {
  const items: ScormItem[] = []

  parentEl.querySelectorAll(":scope > item").forEach((itemEl) => {
    const identifier = itemEl.getAttribute("identifier") || ""
    const title = itemEl.querySelector(":scope > title")?.textContent?.trim() || identifier
    const identifierref = itemEl.getAttribute("identifierref") || undefined

    let href: string | undefined
    if (identifierref && resourcesMap[identifierref]) {
      href = resourcesMap[identifierref].href
    }

    const children = parseItems(itemEl, resourcesMap)

    items.push({ identifier, title, identifierref, href, children })
  })

  return items
}

// Flatten the nested item tree into a simple list of playable SCOs (leaves with hrefs)
export interface FlatSco {
  id: string
  title: string
  href: string
  path: string[] // breadcrumb of ancestor titles
}

export function flattenScos(manifest: ScormManifest): FlatSco[] {
  const scosAll: FlatSco[] = []
  const org = manifest.organizations[0]
  if (!org) return scosAll

  function walk(items: ScormItem[], breadcrumb: string[]) {
    items.forEach((item) => {
      const newBreadcrumb = [...breadcrumb, item.title]
      if (item.children.length === 0 && item.href) {
        // Leaf item with a resolved href → playable SCO
        scosAll.push({
          id: item.identifier,
          title: item.title,
          href: item.href,
          path: breadcrumb,
        })
      } else if (item.children.length > 0) {
        // Has children → recurse
        walk(item.children, newBreadcrumb)
      } else if (item.href && item.identifierref) {
        // Item with href but has children? Treat as a playable SCO
        scosAll.push({
          id: item.identifier,
          title: item.title,
          href: item.href,
          path: breadcrumb,
        })
      }
    })
  }

  walk(org.items, [])
  return scosAll
}

// Find the default launch href (first leaf item's href)
export function findLaunchHref(manifest: ScormManifest): string | undefined {
  const scosAll = flattenScos(manifest)
  return scosAll.length > 0 ? scosAll[0].href : undefined
}
