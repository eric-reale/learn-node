import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from "./modules/autocomplete";
import typeAhead from "./modules/typeAhead";
import ajaxHeart from "./modules/heart";

// Entry point. this is where Webpack is bundling all JS together
// Write all client side JS in modules folder


// autocomplete( $('#address'), $('#lat'), $('#lng') );
// $ replaces document.querySelector

typeAhead($('.search'));


const heartForms = $$('form.heart'); // select all hearts
heartForms.on('submit', ajaxHeart);  // when submit button happens on any, run ajaxHeart fn
// console.log(heartForms);
