import React, { useState } from 'react';
import { 
  TextField, Button, Typography, Box, Paper, Chip, 
  MenuItem, Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import './App.css';

const categories = [
  "Electronics", "Fashion", "Home & Kitchen", "Health & Beauty", 
  "Sports & Fitness", "Books", "Toys & Games", "Automotive"
];

function App() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [finalCategory, setFinalCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  const handleGenerate = async () => {
    if (!productName || !category) return;
    setLoading(true);

    // Fetching the API Key from the .env file
    const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY; 

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `Generate highly detailed product specifications for: ${productName} in the ${category} category.
              Return ONLY a raw JSON object with these keys:
              {
                "title": "A catchy professional title",
                "longDescription": "A detailed 60-word paragraph",
                "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
                "priceRange": "Detailed price range in Indian Rupees (₹)", 
                "tags": ["Tag1", "Tag2", "Tag3"]
              }`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        setProductData(JSON.parse(jsonMatch[0]));
        setFinalCategory(category);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check your internet or API key in .env file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="header">
        <Typography variant="h3" fontWeight="900" className="main-title">
          Product Details Generator AI
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
          Create professional product descriptions in a single click
        </Typography>
      </div>

      <div className="layout-container">
        {/* Input Section */}
        <div className="column">
          <Paper className="card-box" elevation={0}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: '#1e293b' }}>
              Create New Content
            </Typography>
            
            <TextField
              fullWidth
              label="Product Name"
              variant="outlined"
              margin="normal"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <FormControl fullWidth variant="outlined" margin="normal" sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              className="action-btn"
              onClick={handleGenerate}
              disabled={!productName || !category || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Content'}
            </Button>
          </Paper>
        </div>

        {/* Output Section */}
        <div className="column">
          <Paper className="card-box" elevation={0}>
            {!productData && !loading && (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="body1" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Results will appear here...
                </Typography>
              </Box>
            )}

            {loading && (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress thickness={5} />
                <Typography sx={{ mt: 2, fontWeight: '600', color: '#3b82f6' }}>AI is thinking...</Typography>
              </Box>
            )}

            {productData && !loading && (
              <Box className="content-fade-in">
                <Chip label={finalCategory} sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold', mb: 2 }} />
                <Typography variant="h4" className="res-title">{productData.title}</Typography>
                
                <Typography className="res-desc">{productData.longDescription}</Typography>
                
                <div className="price-box">
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
                    Estimated Price
                  </Typography>
                  <Typography variant="h5" fontWeight="800" color="primary">
                    {productData.priceRange}
                  </Typography>
                </div>

                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>Key Features:</Typography>
                <ul className="res-list">
                  {productData.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>

                <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {productData.tags.map((tag, i) => (
                    <Chip key={i} label={`#${tag}`} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default App;