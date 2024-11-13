"use client";

import { ChangeEvent, useRef, useState, useTransition } from "react";

function imageSandbox() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));

      setImageUrls([...imageUrls, ...newImageUrls]);
    }
  };

  const [isPending, startTransition] = useTransition();

  const handleClickUploadImagesButton = () => {
    startTransition(async () => {
      // Your async code here
      // 6:55
    });
  };

  return (
    <div>
      <input
        type="file"
        hidden
        multiple
        ref={imageInputRef}
        onChange={handleImageChange}
      />
      <button onClick={() => imageInputRef.current?.click()}>
        Select Images
      </button>

      <div className="flex gap-4">
        {imageUrls.map((url, index) => (
          <img
            key={url}
            src={url}
            width={300}
            height={300}
            alt={`img-${index}`}
          />
        ))}
      </div>

      <br />

      <button onClick={handleClickUploadImagesButton}>Upload Images</button>
    </div>
  );
}

export default imageSandbox;
