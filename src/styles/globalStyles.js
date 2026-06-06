export const COLORS = {
    primary: "#b40b2d",
    primaryDark: "#922B21",
    primaryLight: "#FFFFFF",
    accent: "#E67E22",
    bg: "#FDF8F5",
    bgCard: "#FFFFFF",
    text: "#1A0A05",
    textMuted: "#7D5A50",
    border: "#EEE0D8",
    sand: "#F5E6D3",
};

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    min-height: 100vh;
  }

  :root {
    --primary: ${COLORS.primary};
    --primary-dark: ${COLORS.primaryDark};
    --primary-light: ${COLORS.primaryLight};
    --accent: ${COLORS.accent};
    --bg: ${COLORS.bg};
    --bg-card: ${COLORS.bgCard};
    --text: ${COLORS.text};
    --text-muted: ${COLORS.textMuted};
    --border: ${COLORS.border};
    --sand: ${COLORS.sand};
  }

  /* Navbar */
  .navbar {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 60px;
    display: flex; align-items: center; gap: 24px;
  }
  
  .logo-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .logo-icon img {
    width: 150px;
    height: 150px;
    object-fit: contain;
  }
  
  .navbar-search {
    flex: 1; max-width: 320px;
    position: relative;
  }
  .navbar-search input {
    width: 100%; padding: 8px 12px 8px 36px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--sand);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text);
    outline: none;
    transition: border-color 0.2s;
  }
  .navbar-search input:focus { border-color: var(--primary); }
  .navbar-search svg {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted);
  }
  .navbar-nav {
    display: flex; align-items: center; gap: 4px;
    margin-left: auto;
  }
  .nav-link {
    padding: 6px 14px;
    font-size: 14px; font-weight: 500;
    color: var(--text-muted);
    cursor: pointer; border-radius: 6px;
    transition: color 0.2s, background 0.2s;
    border: none; background: none;
    position: relative;
  }
  .nav-link:hover { color: var(--text); background: var(--sand); }
  .nav-link.active { color: var(--primary); }
  .nav-link.active::after {
    content: ''; position: absolute;
    bottom: -17px; left: 50%; transform: translateX(-50%);
    width: 24px; height: 2px;
    background: var(--primary); border-radius: 1px;
  }
  .navbar-icons {
    display: flex; align-items: center; gap: 8px;
  }
  .icon-btn {
    width: 36px; height: 36px;
    border: none; background: none; cursor: pointer;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    color: var(--text-muted);
    transition: background 0.2s, color 0.2s;
  }
  .icon-btn:hover { background: var(--sand); color: var(--text); }

  /* City Dropdown */
  .city-dropdown-wrapper {
    position: relative;
  }
  .city-dropdown-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    font-size: 14px; font-weight: 500;
    color: var(--text-muted);
    cursor: pointer; border-radius: 6px;
    transition: color 0.2s, background 0.2s;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
  }
  .city-dropdown-btn:hover { color: var(--text); background: var(--sand); }
  .city-dropdown-btn.active-city { color: var(--primary); }
  .city-dropdown-menu {
    position: absolute; top: calc(100% + 8px); left: 0;
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    min-width: 200px;
    overflow: hidden;
    z-index: 200;
    animation: dropDown 0.18s ease;
  }
  @keyframes dropDown {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .city-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    font-size: 13px; font-weight: 500;
    color: var(--text);
    transition: background 0.15s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .city-dropdown-item:hover { background: var(--sand); }
  .city-dropdown-item.selected { color: var(--primary); background: var(--primary-light); }
  .city-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary); flex-shrink: 0;
  }
  .city-dropdown-divider {
    height: 1px; background: var(--border); margin: 4px 0;
  }
  .city-dropdown-header {
    padding: 10px 16px 6px;
    font-size: 10px; font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* Layout */
  .page-layout {
    max-width: 1100px; margin: 0 auto;
    padding: 24px 16px;
    display: grid; grid-template-columns: 1fr 300px; gap: 24px;
  }
  .main-col { min-width: 0; }
  .side-col { min-width: 0; }

  /* Create Post */
  .create-post-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .create-post-input-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    background: var(--sand);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--text-muted);
    overflow: hidden;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .create-post-input {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text);
    background: var(--sand);
    outline: none; cursor: pointer;
    transition: border-color 0.2s;
  }
  .create-post-input:hover { border-color: var(--primary-light); }
  .create-post-actions {
    display: flex; align-items: center; gap: 8px;
    padding-top: 10px; border-top: 1px solid var(--border);
  }
  .action-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    color: var(--text-muted); cursor: pointer;
    transition: background 0.15s;
  }
  .action-btn:hover { background: var(--sand); }
  .post-btn {
    margin-left: auto;
    background: var(--primary);
    color: white; border: none;
    padding: 8px 20px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
  .post-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
  .post-btn:active { transform: translateY(0); }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    margin-bottom: 12px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .upload-zone:hover { border-color: var(--primary); background: var(--primary-light); }
  .upload-icon { font-size: 28px; margin-bottom: 6px; }
  .upload-text { font-size: 13px; color: var(--text-muted); }

  /* Post card */
  .post-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .post-card:hover { box-shadow: 0 4px 20px rgba(192,57,43,0.08); }
  .post-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px 10px;
  }
  .post-author-info { flex: 1; }
  .post-author-name {
    font-size: 14px; font-weight: 600; color: var(--text);
  }
  .post-location {
    font-size: 11px; color: var(--primary);
    display: flex; align-items: center; gap: 3px; margin-top: 1px;
  }
  .post-more {
    border: none; background: none; cursor: pointer;
    color: var(--text-muted); font-size: 18px; padding: 4px;
  }
  .post-image {
    width: 100%; aspect-ratio: 4/3; object-fit: cover;
    display: block;
  }
  .post-actions {
    display: flex; align-items: center; gap: 4px;
    padding: 10px 14px 6px;
  }
  .post-action-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 6px 10px; border-radius: 8px;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-muted);
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .post-action-btn:hover { background: var(--sand); color: var(--primary); }
  .post-action-btn.liked { color: var(--primary); }
  .bookmark-btn {
    margin-left: auto;
    border: none; background: none; cursor: pointer;
    color: var(--text-muted); padding: 6px;
    transition: color 0.15s;
  }
  .bookmark-btn:hover { color: var(--primary); }
  .post-caption {
    padding: 4px 16px 14px;
    font-size: 13px; line-height: 1.5;
  }
  .post-caption strong { font-weight: 600; }
  .post-tags { color: var(--primary); }
  .post-time {
    font-size: 11px; color: var(--text-muted);
    padding: 0 16px 12px;
  }

  /* Sidebar */
  .side-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .side-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 600;
    color: var(--text); margin-bottom: 14px;
  }
  .traveler-item {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
  }
  .traveler-info { flex: 1; }
  .traveler-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .traveler-role { font-size: 11px; color: var(--text-muted); }
  .follow-btn {
    border: 1px solid var(--primary);
    color: var(--primary); background: none;
    padding: 4px 12px; border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .follow-btn:hover { background: var(--primary); color: white; }
  .view-more-link {
    display: block; text-align: center;
    font-size: 12px; color: var(--primary);
    cursor: pointer; padding-top: 4px;
    font-weight: 500;
  }
  .view-more-link:hover { text-decoration: underline; }

  /* Trending destinations */
  .dest-main {
    border-radius: 12px; overflow: hidden;
    position: relative; margin-bottom: 8px;
    height: 140px; cursor: pointer;
  }
  .dest-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dest-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    padding: 12px;
    color: white;
  }
  .dest-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600;
  }
  .dest-trips { font-size: 10px; opacity: 0.8; }
  .dest-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  }
  .dest-small {
    border-radius: 10px; overflow: hidden;
    position: relative; height: 80px; cursor: pointer;
  }
  .dest-small img { width: 100%; height: 100%; object-fit: cover; }
  .dest-small .dest-overlay { padding: 8px; }
  .dest-small .dest-name { font-size: 13px; }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(3px);
    z-index: 300;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: white;
    border-radius: 20px;
    padding: 28px;
    width: 90%; max-width: 480px;
    position: relative;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    border: none; background: none; cursor: pointer;
    color: var(--text-muted); font-size: 20px;
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .modal-close:hover { background: var(--sand); }
  .modal-title {
    font-size: 16px; font-weight: 600; color: var(--text);
    margin-bottom: 20px;
  }
  .modal-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: var(--primary); }
  .modal-textarea {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; resize: vertical; min-height: 80px;
    margin-bottom: 14px; background: var(--sand);
    transition: border-color 0.2s;
  }
  .modal-textarea:focus { border-color: var(--primary); }
  .modal-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block; }
  .tag-group { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .tag-chip {
    padding: 5px 12px; border-radius: 16px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    border: 1px solid var(--border); background: none;
    color: var(--text-muted); font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .tag-chip.selected { background: var(--primary); color: white; border-color: var(--primary); }
  .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .modal-select {
    width: 100%; padding: 9px 12px;
    border: 1px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; background: white; color: var(--text);
  }
  .modal-actions { display: flex; gap: 10px; }
  .cancel-btn {
    flex: 1; padding: 10px;
    border: 1px solid var(--border); background: none;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer;
    color: var(--text-muted); transition: background 0.15s;
  }
  .cancel-btn:hover { background: var(--sand); }
  .submit-btn {
    flex: 2; padding: 10px;
    background: var(--primary); color: white;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: background 0.2s;
  }
  .submit-btn:hover { background: var(--primary-dark); }

  /* Auth modal */
  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 14px 0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }
  .auth-divider span { font-size: 12px; color: var(--text-muted); }
  .social-btn {
    width: 100%; padding: 10px;
    border: 1px solid var(--border); background: white;
    border-radius: 10px; margin-bottom: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 10px;
    color: var(--text); font-weight: 500;
    transition: background 0.15s;
  }
  .social-btn:hover { background: var(--sand); }
  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    text-align: center; margin-bottom: 20px;
    color: var(--text);
  }
  .auth-welcome { text-align: center; margin-bottom: 20px; font-size: 14px; color: var(--text-muted); }
  .continue-btn {
    width: 100%; padding: 10px;
    background: var(--border); color: var(--text-muted);
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 600; cursor: pointer; margin-top: 8px;
    transition: background 0.2s, color 0.2s;
  }
  .continue-btn.active { background: var(--primary); color: white; }

  /* Profile page */
  .profile-cover {
    height: 200px; width: 100%;
    object-fit: cover; display: block;
    border-radius: 0;
  }
  .profile-body {
    max-width: 860px; margin: 0 auto; padding: 0 16px 32px;
  }
  .profile-avatar-row {
    display: flex; justify-content: center;
    margin-top: -48px; margin-bottom: 12px;
  }
  .profile-avatar {
    width: 96px; height: 96px; border-radius: 50%;
    border: 4px solid white;
    object-fit: cover;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }
  .profile-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    text-align: center; margin-bottom: 4px;
  }
  .profile-bio { text-align: center; color: var(--text-muted); font-size: 13px; margin-bottom: 14px; }
  .profile-stats {
    display: flex; justify-content: center; gap: 32px; margin-bottom: 16px;
  }
  .stat-item { text-align: center; }
  .stat-val { font-size: 18px; font-weight: 700; color: var(--text); }
  .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .profile-btns {
    display: flex; justify-content: center; gap: 10px; margin-bottom: 24px;
  }
  .profile-follow-btn {
    padding: 9px 28px; background: var(--primary); color: white;
    border: none; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .profile-follow-btn:hover { background: var(--primary-dark); }
  .profile-msg-btn {
    padding: 9px 28px; background: none;
    border: 1.5px solid var(--border); border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.2s;
    color: var(--text);
  }
  .profile-msg-btn:hover { background: var(--sand); }
  .profile-grid {
    display: grid; grid-template-columns: 1fr 280px; gap: 20px;
    margin-bottom: 24px;
  }
  .map-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden; padding: 14px;
  }
  .map-card-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: var(--text); }
  .map-card-sub { font-size: 11px; color: var(--text-muted); margin-bottom: 10px; }
  .map-placeholder {
    height: 130px; background: linear-gradient(135deg, #b8dbd9 0%, #e8c9a0 100%);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .map-placeholder::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='35' cy='50' r='3' fill='%23C0392B' opacity='0.8'/%3E%3Ccircle cx='65' cy='35' r='3' fill='%23C0392B' opacity='0.8'/%3E%3Ccircle cx='55' cy='65' r='3' fill='%23C0392B' opacity='0.8'/%3E%3C/svg%3E") center/contain repeat;
    opacity: 0.6;
  }
  .recently-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px;
  }
  .recently-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border);
  }
  .recently-item:last-child { border-bottom: none; }
  .recently-thumb {
    width: 42px; height: 42px; border-radius: 8px;
    object-fit: cover; background: var(--sand);
    flex-shrink: 0;
  }
  .recently-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .recently-sub { font-size: 11px; color: var(--text-muted); }
  .posts-tabs {
    display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 16px;
  }
  .posts-tab {
    padding: 10px 18px; font-size: 13px; font-weight: 500;
    color: var(--text-muted); border: none; background: none;
    cursor: pointer; position: relative;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .posts-tab.active { color: var(--primary); }
  .posts-tab.active::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: var(--primary);
  }
  .posts-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .grid-post {
    aspect-ratio: 1; border-radius: 10px; overflow: hidden; cursor: pointer;
    position: relative;
  }
  .grid-post img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  .grid-post:hover img { transform: scale(1.05); }
  .grid-post-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0);
    transition: background 0.2s;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 8px;
  }
  .grid-post:hover .grid-post-overlay { background: rgba(0,0,0,0.35); }
  .grid-post-caption {
    color: white; font-size: 11px; opacity: 0; transform: translateY(4px);
    transition: opacity 0.2s, transform 0.2s;
  }
  .grid-post:hover .grid-post-caption { opacity: 1; transform: translateY(0); }
  .grid-post-loc { font-size: 10px; color: rgba(255,255,255,0.75); }

  /* City page */
  .city-cover {
    width: 100%; height: 240px; object-fit: cover; display: block;
  }
  .city-info-bar {
    padding: 20px 24px;
    display: flex; align-items: flex-end; justify-content: space-between;
    background: white; border-bottom: 1px solid var(--border);
  }
  .city-title-area { }
  .city-page-name {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700; color: var(--text);
  }
  .city-page-stats {
    display: flex; gap: 20px; margin-top: 4px;
  }
  .city-stat { font-size: 12px; color: var(--text-muted); }
  .city-stat strong { color: var(--text); }
  .city-page-rating {
    display: flex; align-items: center; gap: 4px;
    font-size: 18px; font-weight: 700; color: var(--text);
  }
  .city-page-layout {
    max-width: 1100px; margin: 0 auto;
    padding: 24px 16px;
    display: grid; grid-template-columns: 1fr 280px; gap: 24px;
  }
  .filter-tabs {
    display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .filter-tab {
    padding: 6px 16px; border-radius: 16px;
    border: 1px solid var(--border); background: white;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    color: var(--text-muted); cursor: pointer;
    transition: all 0.15s;
  }
  .filter-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
  .posts-masonry {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  }
  .spot-item {
    display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  }
  .spot-thumb {
    width: 44px; height: 44px; border-radius: 8px; object-fit: cover;
    background: var(--sand); flex-shrink: 0;
  }
  .spot-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .spot-reviews { font-size: 11px; color: var(--text-muted); }
  .spot-rating {
    font-size: 11px; color: var(--accent);
    display: flex; align-items: center; gap: 2px;
  }
  .exp-card {
    border-radius: 10px; overflow: hidden; margin-bottom: 8px; cursor: pointer;
    position: relative; height: 60px;
    background: linear-gradient(135deg, var(--sand), var(--primary-light));
    display: flex; align-items: center; padding: 0 14px;
  }
  .exp-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .exp-sub { font-size: 11px; color: var(--text-muted); }

  /* Responsive */
  @media (max-width: 700px) {
    .page-layout { grid-template-columns: 1fr; }
    .side-col { display: none; }
    .profile-grid { grid-template-columns: 1fr; }
    .city-page-layout { grid-template-columns: 1fr; }
    .posts-masonry { grid-template-columns: 1fr; }
  }
`;