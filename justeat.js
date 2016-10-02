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
  const name = document.querySelector('h1.name').innerText;
  const nameEncoded = encodeURIComponent(name);

  let fullAddressURL = baseURL + address;
  let fullPostcodeURL = `${baseURL}${postcode}&name=${nameEncoded}`;

  function insertTakeoutRating(takeoutData) {
    const justEatRestaurantOverview = document.getElementsByClassName('restaurantOverview')[0];
    const container = document.createElement('div');
    const image = document.createElement('img');

    container.classList.add('o-card');
    container.style.padding = '16px';

    if (takeoutData.SchemeType === 'FHRS') {
      if (takeoutData.RatingValue === 'AwaitingInspection') {
        image.src = `${baseImgURL}awaitinginspection.jpg`;
      } else if (takeoutData.RatingValue === 'AwaitingPublication') {
        image.src = `${baseImgURL}awaitingpublication.jpg`;
      } else if (takeoutData.RatingValue === 'Exempt') {
        image.src = `${baseImgURL}exempt.jpg`;
      } else {
        // England, Wales, NI
        const ratingValue = parseInt(takeoutData.RatingValue, 10);

        if (ratingValue >= 0 && ratingValue <= 5) {
          image.src = `${baseImgURL}${ratingValue}.jpg`;
        } else {
          console.log('edge case?', ratingValue);
        }
      }
    } else if (takeoutData.SchemeType === 'FHIS') {
      switch (takeoutData.RatingValue) {
        case 'Pass':
          image.src = `${baseImgURL}scot_pass.jpg`;
          break;
        case 'Pass and Eat Safe':
          image.src = `${baseImgURL}scot_passandeatsafe.jpg`;
          break;
        case 'Improvement Required':
          image.src = `${baseImgURL}scot_improvementrequired.jpg`;
          break;
        case 'Awaiting Inspection':
          image.src = `${baseImgURL}scot_awaitinginspection.jpg`;
          break;
        case 'Awaiting Publication':
          image.src = `${baseImgURL}scot_awaitingpublication.jpg`;
          break;
        case 'Exempt':
          image.src = `${baseImgURL}scot_exempt.jpg`;
          break;
        default:
          console.log('scottish edge case?', takeoutData.RatingValue);
      }
    }

    container.appendChild(image);
    justEatRestaurantOverview.parentNode.insertBefore(container, justEatRestaurantOverview.nextSibling);
  }

  fetch(fullAddressURL, requestSettings).then((response) => {
    console.log(response);
    if (response.status === 204) {
      fetch(fullPostcodeURL, requestSettings).then((newResponse) => {
        return newResponse.json();
      }).then((newResponseObject) => {
        insertTakeoutRating(newResponseObject);
      });
    } else {
      return response.json();
    }
  }).then((responseObject) => {
    if (responseObject.establishments.length === 1) {
      insertTakeoutRating(responseObject.establishments[0])
    } else {
      console.log('multiples!');
      for (var i = 0; i < responseObject.establishments.length; i++) {
        let establishment = responseObject.establishments[i];
        establishment.similarity = window.similarity(establishment.BusinessName, name)
      }

      let establishments = responseObject.establishments;
      establishments.sort((a, b) => {
        if (a.similarity > b.similarity) {
          return -1;
        } else if (a.similarity < b.similarity) {
          return 1;
        } else return 0;
      });

      if (establishments[0].similarity === 1) {
        insertTakeoutRating(establishments[0]);
      }

    }
  });

} else {
  console.log('stop trying to make fetch happen');
}
