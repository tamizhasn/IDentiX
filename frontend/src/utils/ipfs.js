import axios from "axios";

const JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        project: "IDentix"
      }
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${JWT}`,
      },
    });

    // 🟢 FIX: Use a CORS-friendly gateway (Cloudflare or dweb.link)
    // Avoid 'gateway.pinata.cloud' as it blocks external apps.
    return `https://dweb.link/ipfs/${res.data.IpfsHash}`;
    
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to upload to decentralized storage.");
  }
};