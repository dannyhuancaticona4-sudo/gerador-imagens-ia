export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Erro ao gerar imagem"
      });
    }

    const imageUrl = data.data?.[0]?.url || null;
    const imageBase64 = data.data?.[0]?.b64_json || null;

    if (imageUrl) {
      return res.status(200).json({ imageUrl });
    }

    if (imageBase64) {
      return res.status(200).json({
        imageUrl: `data:image/png;base64,${imageBase64}`
      });
    }

    return res.status(500).json({ error: "Nenhuma imagem foi retornada" });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
