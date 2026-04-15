const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'DELETE') return res.status(405).json({ error: '只接受 DELETE 請求' });

    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'id 為必填' });

    try {
        await notion.pages.update({
            page_id: id,
            archived: true
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};