const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Banco de dados em memória (por enquanto)
// Depois vamos trocar por PostgreSQL
let itens = [];
let tags = ['trabalho', 'pessoal', 'ler depois'];

app.get('/api/items', (req, res) => {
    const { search, tag } = req.query;
    let resultado = [...itens];
    
    // Busca por texto
    if (search) {
        resultado = resultado.filter(item => 
            item.conteudo.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Filtro por tag
    if (tag) {
        resultado = resultado.filter(item => 
            item.tags && item.tags.includes(tag)
        );
    }
    
    res.json({ itens: resultado });
});

app.post('/api/items', (req, res) => {
    const { conteudo, tipo, tags: itemTags } = req.body;
    
    const novoItem = {
        id: Date.now(),
        conteudo,
        tipo: tipo || 'TEXTO',
        tags: itemTags || [],
        criadoEm: new Date().toISOString()
    };
    
    itens.push(novoItem);
    res.status(201).json(novoItem);
});

app.put('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { tags: novasTags } = req.body;
    
    const item = itens.find(i => i.id === id);
    if (item) {
        item.tags = novasTags;
        res.json(item);
    } else {
        res.status(404).json({ error: 'Item não encontrado' });
    }
});

app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    itens = itens.filter(item => item.id !== id);
    res.json({ mensagem: 'Item removido' });
});

app.get('/api/tags', (req, res) => {
    // Extrair todas as tags usadas nos itens
    const tagsUsadas = new Set();
    itens.forEach(item => {
        item.tags?.forEach(tag => tagsUsadas.add(tag));
    });
    res.json({ tags: Array.from(tagsUsadas) });
});

app.get('/teste', (req, res) => {
    res.json({ mensagem: 'Servidor funcionando! 🎉' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
