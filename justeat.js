if (window.fetch) {
  const baseURL = 'https://fsaapiwrapper.jegtnes.com/establishments?address=';
  const baseImgURL = 'http://static.jegtnes.co.uk/hygienechecker/';
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');

  let requestSettings = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
  };

  let address = encodeURIComponent(document.querySelector('p.address').innerText);
  const postcode = encodeURIComponent(document.querySelector('#postcode').innerText);

  let fullURL = baseURL + address;

  function insertTakeoutRating(takeoutData) {
    const justEatRestaurantOverview = document.getElementsByClassName('restaurantOverview')[0];
    const container = document.createElement('div');
    const image = document.createElement('img');

    container.classList.add('o-card');
    container.style.padding = '16px';

    if (takeoutData.SchemeType === 'FHRS') {
      // England, Wales, NI
      const ratingValue = parseInt(takeoutData.RatingValue, 10);

      if (ratingValue >= 0 && ratingValue <= 5) {
        image.src = `${baseImgURL}${ratingValue}.jpg`;
      } else {
        console.log('edge case?', ratingValue);
      }
    } else if (takeoutData.SchemeType === 'FHIS') {
      if (takeoutData.RatingValue === 'Pass') {
        image.src = `${baseImgURL}scot_pass.jpg`
      } else if (takeoutData.RatingValue === 'Pass and Eat Safe') {
        image.src = `${baseImgURL}scot_passandeatsafe.jpg`
      } else if (takeoutData.RatingValue === 'Improvement Required') {
        image.src = `${baseImgURL}scot_improvementrequired.jpg`
      } else {
        console.log('scottish edge case?', takeoutData.RatingValue);
      }
    }

    container.appendChild(image);
    justEatRestaurantOverview.parentNode.insertBefore(container, justEatRestaurantOverview.nextSibling);
  }

  fetch(fullURL, requestSettings).then((response) => {
    console.log(response);
    return response.json();
  }).then((responseObject) => {
    insertTakeoutRating(responseObject)
  });

} else {
  console.log('stop trying to make fetch happen');
}
