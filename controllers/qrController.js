import QRCode from "qrcode";

export const getQrCode = async (req, res) => {
  try {
    let menuUrl;

    if (process.env.PUBLIC_BASE_URL) {
      menuUrl = process.env.PUBLIC_BASE_URL.replace(/\/$/, "") + "/";
    } else {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.get("host");
      menuUrl = `${protocol}://${host}/`;
    }

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2
    });

    res.json({
      url: menuUrl,
      qrImage: qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};