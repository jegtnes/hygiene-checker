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
  let postcodeURL = `${baseURL}${postcode}`;
  let postcodeNameURL = `${postcodeURL}&name=${nameEncoded}`;

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

  fetch(fullAddressURL, requestSettings).then((addressResponse) => {
    console.log(addressResponse);
    if (addressResponse.status === 204) {
      fetch(postcodeNameURL, requestSettings).then((postcodeNameSearch) => {
        console.log('what');
        if (postcodeNameSearch.status === 204) {
          fetch(postcodeURL, requestSettings).then((postcodeSearch) => {
            console.log('the fuck');
            console.log(postcodeSearch);
            if (postcodeSearch.status === 200) {
              return postcodeSearch.json();
            } else {
              console.log('postcode search failed');
              console.log(postcodeSearch);
            }
          }).then((postcodeSearchObject) => {
            if (postcodeSearchObject.establishments.length > 1) {
              console.log('postcode results longer than 1');
              let establishments = addSimilarityAndSort(postcodeSearchObject.establishments, name);
              if (
                establishments[0].similarity >= 0.9 ||
                establishments[0].similarity >= (establishments[1].similarity * 2)
              ) {
                insertTakeoutRating(establishments[0]);
              } else {
                console.log('failed');
                console.log(establishments);
              }
            } else if (postcodeSearchObject.establishments.length === 1) {
              console.log('postcode result exactly 1');
              insertTakeoutRating(postcodeSearchObject.establishments[0]);
            } else if (postcodeSearchObject.establishments.length === 0) {
              console.log('postcode result empty');
            } else {
              console.log('postcode result fucked m8');
              console.log(postcodeSearchObject);
            }
          });
        } else {
          return postcodeNameSearch.json();
        }
      }).then((postcodeNameSearchObject) => {
        if (postcodeNameSearchObject.establishments.length > 1) {
          console.log('postcode+name results longer than 1');
        } else if (postcodeNameSearchObject.establishments.length === 1){
          insertTakeoutRating(postcodeNameSearchObject.establishments[0]);
        } else {
          console.log('¯\_(ツ)_/¯');
        }
      });
    } else {
      return addressResponse.json();
    }
  }).then((addressResponseObject) => {
    if (addressResponseObject.establishments.length === 1) {
      insertTakeoutRating(addressResponseObject.establishments[0])
    } else {
      console.log('multiples!');
      let establishments = addSimilarityAndSort(addressResponseObject.establishments, name);
      console.log(establishments);

      if (
        establishments[0].similarity >= 0.9 ||
        establishments[0].similarity >= (establishments[1].similarity * 2)
      ) {
        insertTakeoutRating(establishments[0]);
      }
    }
  });

} else {
  console.log('stop trying to make fetch happen');
}

function addSimilarityAndSort(establishments, name) {
  for (var i = 0; i < establishments.length; i++) {
    let establishment = establishments[i];
    establishment.similarity = window.similarity(establishment.BusinessName, name)
  }

  return establishments.sort((a, b) => {
    if (a.similarity > b.similarity) {
      return -1;
    } else if (a.similarity < b.similarity) {
      return 1;
    } else return 0;
  });
}
