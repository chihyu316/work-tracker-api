const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).json({ error: '只接受 PUT 請求' });

    const { id, title, date, type, rating, note } = req.body;

    if (!id) return res.status(400).json({ error: 'id 為必填' });

    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                項目名稱: {
                    title: [{ text: { content: title } }]
                },
                日期: {
                    date: { start: date }
                },
                類型: {
                    select: { name: type || '其他' }
                },
                評分: {
                    number: rating || 0
                },
                備註: {
                    rich_text: [{ text: { content: note || '' } }]
                }
            }
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};