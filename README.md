# WhatsApp Channel Analyzer 🔍

A modern, responsive web application to analyze WhatsApp Channel information. Built with clean UI/UX and multi-language support.

![WhatsApp Channel Analyzer](https://img.shields.io/badge/WhatsApp-Channel%20Analyzer-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

---

## ✨ Features

- 🔍 **Channel Analysis** - Get detailed information about any WhatsApp channel
- 📊 **Follower Count** - View the number of followers/subscribers
- 📅 **Creation Date** - See when the channel was created
- ✅ **Verified Badge** - Check if channel is verified
- 📝 **Description** - View channel description with linkify support
- 🎨 **Dark/Light Mode** - Toggle between themes
- 🌐 **Multi-language** - Support for Indonesian (ID) and English (EN)
- 📱 **Fully Responsive** - Works on all devices (Desktop, Tablet, Mobile)
- ⚡ **Fast & Lightweight** - No bloat, clean code
- 🔒 **No Login Required** - Use instantly without registration

---

## 🚀 Live Demo

Try it now: [WhatsApp Channel Analyzer](https://chwaanalyzer.netlify.app)

---

## 📸 Screenshots

### Light Mode
![Light Mode](https://files.njy.my.id/8hfa.jpg)

### Dark Mode
![Dark Mode](https://files.njy.my.id/q7po.jpg)

### Settings
![Settings](https://files.njy.my.id/z0311.jpg)

---

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **JavaScript (ES6)** - Vanilla JS, no frameworks
- **Font Awesome** - Icons
- **Google Fonts** - Inter font family
- **SweetAlert2** - Beautiful alerts

---

## 📦 Installation

### Clone the repository


## 🎨 Customization

### Change Theme Colors

Edit the CSS variables in `anjay.css`:

```css
:root {
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --bg-primary: #f8fafc;
    /* ... more variables */
}
```

### Add More Languages

Edit the `translations` object in `alok.js`:

```javascript
var translations = {
    id: { /* Indonesian translations */ },
    en: { /* English translations */ },
    es: { /* Add Spanish here */ }
};
```

---

## 📁 Project Structure

```
WhatsApp-Channel-Analyzer/
├── index.html          # Main HTML file with SEO tags
├── anjay.css           # Custom styles
├── alok.js             # JavaScript functionality
├── README.md           # This file
├── 
```

---

## 🔌 API

This application uses the following API:

- **Endpoint**: `https://api.fikprojects.web.id/cekidch`
- **API Key**: `FreeKeys`
- **Method**: GET
- **Parameters**: `apikey`, `url`

### API Response Format

```json
{
    "status": true,
    "creator": "Fik Projects",
    "data": {
        "id": "120363421126273338@newsletter",
        "name": "Channel Name",
        "Pengikut": 2329,
        "KreatorTime": 1751552675,
        "Deskripsi": "Channel description",
        "State": "ACTIVE",
        "Verified": "Tidak",
        "Photo": "https://...",
        "Invite": "0029Vb6...",
        "Reaction": "ALL"
    }
}
```


## 🙏 Support

If you like this project, please give it a ⭐ star on GitHub!

---


