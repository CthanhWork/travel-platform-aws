"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { placesService } from "@/services/places.service";
import { useAuthStore } from "@/stores/auth-store";

interface SavePlaceButtonProps {
  placeId: string;
  placeName: string;
  initialSaved?: boolean;
  variant?: "card" | "hero" | "primary";
}

const variantClasses = {
  card: "h-11 w-11 justify-center rounded-full bg-white/95 px-0 text-ink shadow-lg hover:bg-white",
  hero: "rounded-full bg-white/95 px-5 py-3 text-ink shadow-lg hover:bg-white",
  primary:
    "rounded-full border border-terracotta bg-white px-6 py-3 text-terracotta hover:bg-terracotta-tint",
};

export function SavePlaceButton({
  placeId,
  placeName,
  initialSaved = false,
  variant = "primary",
}: SavePlaceButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [message, setMessage] = useState("");

  const { data: savedPlaces } = useQuery({
    queryKey: ["saved-places"],
    queryFn: () => placesService.getSavedPlaces(),
    enabled: hasHydrated && isAuthenticated,
  });

  const isSaved = savedPlaces
    ? savedPlaces.some((savedPlace) => savedPlace.id === placeId)
    : initialSaved;

  const mutation = useMutation({
    mutationFn: () =>
      isSaved
        ? placesService.unsavePlace(placeId)
        : placesService.savePlace(placeId),
    onSuccess: async () => {
      setMessage(isSaved ? "Removed from saved places" : "Saved successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["saved-places"] }),
        queryClient.invalidateQueries({ queryKey: ["place", placeId] }),
      ]);
    },
    onError: () =>
      setMessage("Could not update saved places. Please try again."),
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMessage("");

    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/places/${placeId}`);
      return;
    }

    mutation.mutate();
  };

  const compact = variant === "card";
  const label = mutation.isPending
    ? "Saving..."
    : isSaved
      ? "Saved"
      : "Save place";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasHydrated || mutation.isPending}
        aria-label={`${isSaved ? "Remove" : "Save"} ${placeName}`}
        title={compact ? label : undefined}
        className={`inline-flex items-center gap-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${variantClasses[variant]} ${isSaved && variant === "primary" ? "bg-terracotta text-white hover:bg-terracotta-hover" : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z"
          />
        </svg>
        {compact ? (
          <span className="sr-only">{label}</span>
        ) : (
          <span>{label}</span>
        )}
      </button>
      {message && !compact ? (
        <p
          className={`absolute right-0 top-full z-10 mt-2 w-64 text-right text-xs ${mutation.isError ? "text-red-600" : "text-green-700"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
