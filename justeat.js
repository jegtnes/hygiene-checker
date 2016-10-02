if (window.fetch) {
  console.log('fetch');
  const baseURL = 'https://fsaapiwrapper.jegtnes.com/establishments?address=';
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');

  let requestSettings = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
  };

  let address = encodeURIComponent(document.querySelector('p.address').innerText);

  let fullURL = baseURL + address;

  fetch(fullURL, requestSettings).then((response) => {
    console.log(response);
    return response.text();
  }).then((text) => {
    console.log('food hygiene rating: ' + text);
  });

} else {
  console.log('stop trying to make fetch happen');
}
