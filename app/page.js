"use client";

import { CldImage } from "next-cloudinary";
import { redirect } from "next/navigation";

export default function Home() {

  return (
    <CldImage
      src="cld-sample-5" // Use this sample image or upload your own via the Media Library
      width="500" // Transform the image: auto-crop to square aspect_ratio
      height="500"
      crop={{
        type: 'auto',
        source: true
      }}
    />
  )

}
