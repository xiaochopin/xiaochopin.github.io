document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.things');
  const dataTag = document.getElementById('friends-data');

  if (!container || !dataTag) return;

  let data = [];
  try {
    data = JSON.parse(dataTag.textContent.trim() || '[]');
  } catch (err) {
    console.error('解析友链数据失败:', err);
    return;
  }

  if (!Array.isArray(data) || data.length === 0) return;

  const html = data.map(item => `
    <div class="things-item">
      <div class="things-avatar">
        <img src="${item.img}" alt="${item.title}" />
      </div>
      <div class="things-info">
        <div class="things-title">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          <span class="things-subtitle">——${item.name}</span>
        </div>
        <div class="things-list">
          <div>${item.desc}</div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
});
