import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ali-melih-aksoy-portfolio-secret-key-2026';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Helper to read database
const readData = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading data file, initializing empty:', error);
    return {
      about: {},
      skills: { languages: [], frameworks: [], databases: [], tools: [] },
      projects: [],
      certificates: [],
      experience: [],
      education: {},
      adminPassword: 'admin123'
    };
  }
};

// Helper to write database
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to data file:', error);
    return false;
  }
};

// Check and hash password on start if not already hashed
const initPassword = () => {
  const data = readData();
  if (data.adminPassword && !data.adminPassword.startsWith('$2')) {
    console.log('Hashing raw password in data.json...');
    const salt = bcrypt.genSaltSync(10);
    data.adminPassword = bcrypt.hashSync(data.adminPassword, salt);
    writeData(data);
    console.log('Password successfully hashed.');
  }
};
initPassword();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API ROUTES

// Get public portfolio data (excluding password)
app.get('/api/portfolio', (req, res) => {
  const data = readData();
  const { adminPassword, ...publicData } = data;
  res.json(publicData);
});

// Upload file endpoint (admin auth required)
app.post('/api/upload', authenticateToken, (req, res) => {
  const { filename, fileData } = req.body;
  if (!filename || !fileData) {
    return res.status(400).json({ message: 'Missing filename or fileData' });
  }

  try {
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid base64 data format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 15MB maximum file size limit
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ message: 'File is too large. Max limit is 15MB.' });
    }

    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(uploadsDir, cleanFilename);

    // Save to public/uploads
    fs.writeFileSync(filePath, buffer);

    // Also write to dist/uploads if dist exists so production builds get it instantly
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      const distUploadsDir = path.join(distDir, 'uploads');
      if (!fs.existsSync(distUploadsDir)) {
        fs.mkdirSync(distUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(distUploadsDir, cleanFilename), buffer);
    }

    res.json({ success: true, url: `/uploads/${cleanFilename}`, mimeType });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to process file upload.' });
  }
});

// Disposable email domains blocklist
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com',
  'sharklasers.com', 'dispostable.com', 'getairmail.com', 'maildrop.cc',
  '10minutemail.com', 'tempmailaddress.com', 'crazymailing.com', 'throwawaymail.com',
  'mailinator2.com', 'yopmail.fr', 'yopmail.net', 'disposable.com', 'temp-mail.org',
  'tempmail.co', 'mailnesia.com', 'mailcatch.com', 'generator.email'
];

// Contact form submission relay
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları (Ad, E-posta, Mesaj) doldurun.' });
  }

  // Strict regex email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Lütfen geçerli bir e-posta adresi girin.' });
  }

  // Disposable/fake email validation
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (DISPOSABLE_DOMAINS.includes(emailDomain)) {
    return res.status(400).json({ message: 'Sahte veya geçici e-posta adresleri kabul edilmemektedir. Lütfen gerçek bir e-posta adresi girin.' });
  }

  try {
    const targetEmail = 'aksoyalimelih@gmail.com';
    const formsubmitUrl = `https://formsubmit.co/ajax/${targetEmail}`;

    const response = await fetch(formsubmitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        _template: 'table',
        _subject: `Portföy İletişim Mesajı: ${subject || 'Konu Belirtilmedi'}`,
        "Gönderen": name,
        "E-posta": email,
        "Konu": subject || 'Belirtilmedi',
        "Mesaj": message
      })
    });

    const data = await response.json();
    
    if (response.ok && (data.success === 'true' || data.success === true)) {
      res.json({ success: true, message: 'Mesajınız başarıyla iletildi!' });
    } else if (data.message && (data.message.includes('Activation') || data.message.includes('needs Activation'))) {
      res.json({ success: true, message: 'İlk gönderim için e-postanıza bir aktivasyon bağlantısı gönderildi! Lütfen gmail gelen kutunuzu kontrol edip aktifleştirin.' });
    } else {
      console.error('FormSubmit error:', data);
      res.status(500).json({ message: 'E-posta servisi yanıt vermedi. Lütfen daha sonra tekrar deneyin.' });
    }
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Mesaj iletilirken sunucu hatası oluştu.' });
  }
});

// Admin login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const data = readData();
  const isMatch = bcrypt.compareSync(password, data.adminPassword);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, message: 'Login successful' });
});

// Update portfolio data (secured)
app.post('/api/portfolio', authenticateToken, (req, res) => {
  const { about, skills, projects, certificates, experience, education } = req.body;
  const data = readData();

  // Update content fields, keeping adminPassword intact
  const updatedData = {
    about: about || data.about,
    skills: skills || data.skills,
    projects: projects || data.projects,
    certificates: certificates || data.certificates,
    experience: experience || data.experience,
    education: education || data.education,
    adminPassword: data.adminPassword // Preserve the hashed password
  };

  if (writeData(updatedData)) {
    const { adminPassword, ...publicData } = updatedData;
    res.json({ message: 'Portfolio updated successfully', data: publicData });
  } else {
    res.status(500).json({ message: 'Failed to write data to file' });
  }
});

// Change admin password (secured)
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  const data = readData();
  const isMatch = bcrypt.compareSync(currentPassword, data.adminPassword);

  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  const salt = bcrypt.genSaltSync(10);
  data.adminPassword = bcrypt.hashSync(newPassword, salt);

  if (writeData(data)) {
    res.json({ message: 'Password changed successfully' });
  } else {
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Serve React Frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is running. Frontend has not been built yet (dist folder not found).');
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
