const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      reject(new Error("Please choose an image smaller than 1 MB."));
      return;
    }

    resolve({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    });
  });
}

export async function readImageFiles(files, maxFiles = 4) {
  const selectedFiles = Array.from(files || []).slice(0, maxFiles);
  const images = await Promise.all(selectedFiles.map((file) => readImageFile(file)));

  return images.filter(Boolean);
}
