import QRCode from 'qrcode';

export const getQrCode = async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const menuUrl = `${protocol}://${host}/`;

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