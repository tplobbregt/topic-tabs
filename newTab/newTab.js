const topicInput = document.getElementById('topic-input');
const inputMsg = document.getElementById('input-msg');
const mainImgBox = document.getElementById('main-img-box');
const imgText = document.getElementById('img-txt');
const imgPhotographer = document.getElementById('img-photographer');

(() => {
  checkNewTopic();
  getTopic();
  getImages();
})();

function checkNewTopic() {
  topicInput.onkeydown = e => {
    if (e.keyCode === 13) {
      setTopic(event.target.value);
      topicInput.value = event.target.value;
      topicInput.disabled = true;
      topicInput.style.cssText =
        'color: rgb(71, 71, 71); border-color rgb(71, 71, 71);';
    }
  };
}

function getTopic() {
  chrome.storage.local.get('topic', data => {
    if (data.topic) {
      const { topic } = data;
      topicInput.placeholder = topic;
    } else {
      topicInput.placeholder = 'Enter a topic..';
    }
  });
}

function getImages() {
  chrome.storage.local.get('images', data => {
    if (data.images) {
      const { images } = data;
      const image = images[Math.floor(Math.random() * images.length)];
      const mainImg = document.createElement('IMG');
      mainImg.src = image.photo_url;
      mainImg.id = 'main-img';
      mainImgBox.appendChild(mainImg);
      imgText.innerText = 'Photo by:';
      imgPhotographer.innerText = ` ${image.photographer}`;
      imgPhotographer.href = image.photographer_url;
    }
  });
}

async function setTopic(topic) {
  try {
    inputMsg.innerText = 'Loading...';
    inputMsg.style.cssText = 'background-color: #007bff';

    const resp = await fetch(
      `http://topictabsapi-web-prod.us-east-2.elasticbeanstalk.com/api/topic/?topic=${topic}`
      // `https://topic-tabs-api-java.herokuapp.com/api/topic/?topic=${topic}`
    );
    const data = await resp.json();

    if (data) {
      const imageList = [];
      data.photos.forEach(p => {
        imageList.push({
          photographer: p.photographer,
          photographer_url: p.photographer_url,
          photo_url: p.src.large2x,
          pexel_url: p.url
        });
      });

      chrome.storage.local.set({ topic: topic, images: imageList }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error setting data to ${JSON.stringify(data)}: ${
              chrome.runtime.lastError.message
            }`
          );
        } else {
          inputMsg.innerText = 'Loaded - Reload tab';
          inputMsg.style.cssText = 'background-color: #28a745';
        }
      });
    }
  } catch (err) {
    inputMsg.innerText = 'Unable to load topic';
    inputMsg.style.cssText = 'background-color: #dc3545';
    topicInput.disabled = false;
    topicInput.style.cssText = 'color: #fff; border-color rgb(71, 71, 71);';
  }
}
