"use client"

import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)

    const update = () => setMatches(media.matches)
    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }

    // Safari < 14
    // eslint-disable-next-line deprecation/deprecation
    media.addListener(update)
    // eslint-disable-next-line deprecation/deprecation
    return () => media.removeListener(update)
  }, [query])

  return matches
}

