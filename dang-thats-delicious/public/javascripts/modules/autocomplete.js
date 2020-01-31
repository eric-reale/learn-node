function autocomplete(input, latInput, lngInput) {
  if(!input) return; // skip this function from runnig if there is no input on page
  const dropdown = new google.maps.places.AutoComplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    // console.log(place);
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  })

  input.on('keydown', (e) => { // can use .on because of bling.js
    if(e.keyCode === 13) e.preventDefault(); // if user hits enter on address, don't submit form
  })

  // not wokring because I need a new Google API key.
}

export default autocomplete;
