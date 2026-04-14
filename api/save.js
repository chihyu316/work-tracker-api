const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只接受 POST 請求' });
    }

    const { title, date, type, rating, note } = req.body;

    if (!title || !date) {
        return res.status(400).json({ error: '項目名稱和日期為必填' });
    }

    try {
        const response = await notion.pages.create({
            parent: { database_id: DATABASE_ID },
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

        return res.status(200).json({ success: true, id: response.id });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};