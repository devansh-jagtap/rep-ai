"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function SignedUpToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("signedUp") === "1") {
      toast.success("Account created! Sign in to continue.")
    }
  }, [searchParams])

  return null
}
