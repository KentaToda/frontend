(function() {
  'use strict';

  const API_BASE_URL = 'http://localhost:8000';
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/analyze`;

  // DOM Elements
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadContent = document.getElementById('uploadContent');
  const previewImage = document.getElementById('previewImage');
  const clearBtn = document.getElementById('clearBtn');
  const submitBtn = document.getElementById('submitBtn');
  const resultSection = document.getElementById('resultSection');
  const errorMessage = document.getElementById('errorMessage');
  const itemName = document.getElementById('itemName');
  const priceRange = document.getElementById('priceRange');
  const advice = document.getElementById('advice');

  let selectedFile = null;
  let imageBase64 = null;

  // Initialize
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Clear button
    clearBtn.addEventListener('click', clearImage);

    // Submit button
    submitBtn.addEventListener('click', submitAppraisal);
  }

  function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  function processFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showError('JPG、PNG、またはWebP形式の画像を選択してください。');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('画像サイズは10MB以下にしてください。');
      return;
    }

    selectedFile = file;
    hideError();

    // Convert to base64 and show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imageBase64 = e.target.result;
      previewImage.src = imageBase64;
      uploadArea.classList.add('has-image');
      clearBtn.hidden = false;
      submitBtn.disabled = false;
    };
    reader.onerror = () => {
      showError('画像の読み込みに失敗しました。');
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    selectedFile = null;
    imageBase64 = null;
    fileInput.value = '';
    previewImage.src = '';
    uploadArea.classList.remove('has-image');
    clearBtn.hidden = true;
    submitBtn.disabled = true;
    hideResult();
    hideError();
  }

  async function submitAppraisal() {
    if (!imageBase64) {
      showError('画像を選択してください。');
      return;
    }

    setLoadingState(true);
    hideError();
    hideResult();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `エラーが発生しました (${response.status})`);
      }

      const data = await response.json();
      showResult(data);
    } catch (error) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('サーバーに接続できません。バックエンドが起動しているか確認してください。');
      } else {
        showError(error.message || '鑑定に失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('loading', loading);

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    btnText.hidden = loading;
    btnLoading.hidden = !loading;
  }

  function showResult(data) {
    itemName.textContent = data.item_name || '-';
    priceRange.textContent = data.price_range || '-';
    advice.textContent = data.advice || '-';
    resultSection.hidden = false;
  }

  function hideResult() {
    resultSection.hidden = true;
    itemName.textContent = '-';
    priceRange.textContent = '-';
    advice.textContent = '-';
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function hideError() {
    errorMessage.hidden = true;
    errorMessage.textContent = '';
  }

  // Start app
  init();
})();
