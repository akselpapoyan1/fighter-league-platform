import React from "react";

interface UploadPhotoProps {
  preview: string | null;
  removeImage: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadPhoto: React.FC<UploadPhotoProps> = ({
  preview,
  removeImage,
  handleFileChange,
}) => {
  return (
    <div className="w-full flex flex-col items-center bg-gray-50 p-6 rounded-xl">
      <label
        htmlFor="fileUpload"
        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition"
      >
        <svg
          className="w-10 h-10 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-gray-500 font-medium">
          Click or drag image to upload
        </p>
        <input
          id="fileUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {preview && (
        <div className="pt-6 flex flex-col items-center">
          <img
            src={preview}
            alt="preview"
            className="w-40 h-40 object-cover rounded-xl shadow-md border border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow transition"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
