var map;
var marker;

/*
    if(map === undefined){
        var pos = {lat: 60.45, lng: 22.2833};
    }
*/
function initMap(latitude, longitude){
    createMap(63.6667, 22.7);
}

function moveMap(latitude, longitude){
    createMap(latitude, longitude);
}

function createMap(latitude, longitude){
    var pos = {lat: latitude, lng: longitude};
    var map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
         style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
         position: google.maps.ControlPosition.TOP_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
         position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
         position: google.maps.ControlPosition.LEFT_TOP
        },
        fullscreenControl: true
        });
    var marker = new google.maps.Marker({
          position: pos,
          map: map,
        });
    console.log(map);
}
$(document).ready(function () {
    var history = [];
    if(storageAvailable("localStorage")){
        //Check if there's some juicy localstorage history
        if(localStorage.getItem("history") !== null){
            history = JSON.parse(localStorage.history);
            //Yeah there is, now append it to the inputHistory
            //list so the user can see it.
            for(i=0; i<history.length; i++){
                $("#inputHistory").append(history[i]);
            }
            console.log("Found existing list in local storage");
        }else{
            //If there is no history in local storage, put the empty list there
            localStorage.history = JSON.stringify(history);
            console.log("Putting empty list in local storage");
        }
    }else{
        alert("Yo browsa so old, she don't support local storage.");
    }
    //Button was clicked
    //take info and send it to zippopotamus
    //Then parse the response.
    $("#inputBox").on('click', '#button', function () {
        console.log("Click!");
        var zip_code = $("#zipCodeField").val();
        var country = $("#countrySelector").val();
        history = JSON.parse(localStorage.history);

        //If less than 10 in the history just keep adding
        if(history.length < 10){
            $("#inputHistory").append("<li>" + country + " - " + zip_code + "</li>");
            var item = "<li>" + country + " - " + zip_code + "</li>";
            history.push(item);
        }
        //If 10 or more in history remove first element and add
        else{
            $("#inputHistory").append("<li>" + country + " - " + zip_code + "</li>");
            $("#inputHistory li:first").remove();
            var item = "<li>" + country + " - " + zip_code + "</li>";
            history.push(item);
            history.shift();
        }
        localStorage.history = JSON.stringify(history);

        //zippopotamus
        var client = new XMLHttpRequest();
        var url = "https://api.zippopotam.us/"+getCountryCode(country)+"/"+zip_code;
        client.open("GET", url, true);
        client.onreadystatechange = function() {
            //Wait until it's done, yo.
        	if(client.readyState == 4) {
                $("#outputBoxTable").empty();
                var json_response = client.responseText;
                var response = JSON.parse(json_response);

                //No such ZIP code in this country
                if(response.places !== null && response.places !== undefined){
                    var lat = parseFloat(response.places[0].latitude);
                    var lon = parseFloat(response.places[0].longitude);
                    console.log("setCenter() to " + lat + "," + lon);
                    createMap(lat, lon);
                    //Create a row entry in the output "table"
                    $("#outputBoxTable").append(`
                    <div id="output_table_row">
        				<p class="col-3">`+country+`</p>
        				<p class="col-3">`+lat+`</p>
        				<p class="col-3">`+lon+`</p>
        			</div>`);
                }

        	};
        };
        client.send();
    });


    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }


    function getCountryCode (country) {
        if (isoCountries.hasOwnProperty(country)) {
            return isoCountries[country];
        } else {
            return country;
        }
    }
    var isoCountries = {
           'Afghanistan': 'AF',
           'Aland Islands': 'AX',
           'Albania': 'AL',
           'Algeria': 'DZ',
           'American Samoa': 'AS',
           'Andorra': 'AD',
           'Angola': 'AO',
           'Anguilla': 'AI',
           'Antarctica': 'AQ',
           'Antigua And Barbuda': 'AG',
           'Argentina': 'AR',
           'Armenia': 'AM',
           'Aruba': 'AW',
           'Australia': 'AU',
           'Austria': 'AT',
           'Azerbaijan': 'AZ',
           'Bahamas': 'BS',
           'Bahrain': 'BH',
           'Bangladesh': 'BD',
           'Barbados': 'BB',
           'Belarus': 'BY',
           'Belgium': 'BE',
           'Belize': 'BZ',
           'Benin': 'BJ',
           'Bermuda': 'BM',
           'Bhutan': 'BT',
           'Bolivia': 'BO',
           'Bosnia And Herzegovina': 'BA',
           'Botswana': 'BW',
           'Bouvet Island': 'BV',
           'Brazil': 'BR',
           'British Indian Ocean Territory': 'IO',
           'Brunei Darussalam': 'BN',
           'Bulgaria': 'BG',
           'Burkina Faso': 'BF',
           'Burundi': 'BI',
           'Cambodia': 'KH',
           'Cameroon': 'CM',
           'Canada': 'CA',
           'Cape Verde': 'CV',
           'Cayman Islands': 'KY',
           'Central African Republic': 'CF',
           'Chad': 'TD',
           'Chile': 'CL',
           'China': 'CN',
           'Christmas Island': 'CX',
           'Cocos (Keeling) Islands': 'CC',
           'Colombia': 'CO',
           'Comoros': 'KM',
           'Congo': 'CG',
           'Congo, Democratic Republic': 'CD',
           'Cook Islands': 'CK',
           'Costa Rica': 'CR',
           'Cote D\'Ivoire': 'CI',
           'Croatia': 'HR',
           'Cuba': 'CU',
           'Cyprus': 'CY',
           'Czech Republic': 'CZ',
           'Denmark': 'DK',
           'Djibouti': 'DJ',
           'Dominica': 'DM',
           'Dominican Republic': 'DO',
           'Ecuador': 'EC',
           'Egypt': 'EG',
           'El Salvador': 'SV',
           'Equatorial Guinea': 'GQ',
           'Eritrea': 'ER',
           'Estonia': 'EE',
           'Ethiopia': 'ET',
           'Falkland Islands': 'FK',
           'Faroe Islands': 'FO',
           'Fiji': 'FJ',
           'Finland': 'FI',
           'France': 'FR',
           'French Guiana': 'GF',
           'French Polynesia': 'PF',
           'French Southern Territories': 'TF',
           'Gabon': 'GA',
           'Gambia': 'GM',
           'Georgia': 'GE',
           'Germany': 'DE',
           'Ghana': 'GH',
           'Gibraltar': 'GI',
           'Greece': 'GR',
           'Greenland': 'GL',
           'Grenada': 'GD',
           'Guadeloupe': 'GP',
           'Guam': 'GU',
           'Guatemala': 'GT',
           'Guernsey': 'GG',
           'Guinea': 'GN',
           'Guinea-Bissau': 'GW',
           'Guyana': 'GY',
           'Haiti': 'HT',
           'Heard Island & Mcdonald Islands': 'HM',
           'Holy See (Vatican City State)': 'VA',
           'Honduras': 'HN',
           'Hong Kong': 'HK',
           'Hungary': 'HU',
           'Iceland': 'IS',
           'India': 'IN',
           'Indonesia': 'ID',
           'Iran, Islamic Republic Of': 'IR',
           'Iraq': 'IQ',
           'Ireland': 'IE',
           'Isle Of Man': 'IM',
           'Israel': 'IL',
           'Italy': 'IT',
           'Jamaica': 'JM',
           'Japan': 'JP',
           'Jersey': 'JE',
           'Jordan': 'JO',
           'Kazakhstan': 'KZ',
           'Kenya': 'KE',
           'Kiribati': 'KI',
           'Korea': 'KR',
           'Kuwait': 'KW',
           'Kyrgyzstan': 'KG',
           'Lao People\'s Democratic Republic': 'LA',
           'Latvia': 'LV',
           'Lebanon': 'LB',
           'Lesotho': 'LS',
           'Liberia': 'LR',
           'Libyan Arab Jamahiriya': 'LY',
           'Liechtenstein': 'LI',
           'Lithuania': 'LT',
           'Luxembourg': 'LU',
           'Macao': 'MO',
           'Macedonia': 'MK',
           'Madagascar': 'MG',
           'Malawi': 'MW',
           'Malaysia': 'MY',
           'Maldives': 'MV',
           'Mali': 'ML',
           'Malta': 'MT',
           'Marshall Islands': 'MH',
           'Martinique': 'MQ',
           'Mauritania': 'MR',
           'Mauritius': 'MU',
           'Mayotte': 'YT',
           'Mexico': 'MX',
           'Micronesia, Federated States Of': 'FM',
           'Moldova': 'MD',
           'Monaco': 'MC',
           'Mongolia': 'MN',
           'Montenegro': 'ME',
           'Montserrat': 'MS',
           'Morocco': 'MA',
           'Mozambique': 'MZ',
           'Myanmar': 'MM',
           'Namibia': 'NA',
           'Nauru': 'NR',
           'Nepal': 'NP',
           'Netherlands': 'NL',
           'Netherlands Antilles': 'AN',
           'New Caledonia': 'NC',
           'New Zealand': 'NZ',
           'Nicaragua': 'NI',
           'Niger': 'NE',
           'Nigeria': 'NG',
           'Niue': 'NU',
           'Norfolk Island': 'NF',
           'Northern Mariana Islands': 'MP',
           'Norway': 'NO',
           'Oman': 'OM',
           'Pakistan': 'PK',
           'Palau': 'PW',
           'Palestinian Territory, Occupied': 'PS',
           'Panama': 'PA',
           'Papua New Guinea': 'PG',
           'Paraguay': 'PY',
           'Peru': 'PE',
           'Philippines': 'PH',
           'Pitcairn': 'PN',
           'Poland': 'PL',
           'Portugal': 'PT',
           'Puerto Rico': 'PR',
           'Qatar': 'QA',
           'Reunion': 'RE',
           'Romania': 'RO',
           'Russian Federation': 'RU',
           'Rwanda': 'RW',
           'Saint Barthelemy': 'BL',
           'Saint Helena': 'SH',
           'Saint Kitts And Nevis': 'KN',
           'Saint Lucia': 'LC',
           'Saint Martin': 'MF',
           'Saint Pierre And Miquelon': 'PM',
           'Saint Vincent And Grenadines': 'VC',
           'Samoa': 'WS',
           'San Marino': 'SM',
           'Sao Tome And Principe': 'ST',
           'Saudi Arabia': 'SA',
           'Senegal': 'SN',
           'Serbia': 'RS',
           'Seychelles': 'SC',
           'Sierra Leone': 'SL',
           'Singapore': 'SG',
           'Slovakia': 'SK',
           'Slovenia': 'SI',
           'Solomon Islands': 'SB',
           'Somalia': 'SO',
           'South Africa': 'ZA',
           'South Georgia And Sandwich Isl.': 'GS',
           'Spain': 'ES',
           'Sri Lanka': 'LK',
           'Sudan': 'SD',
           'Suriname': 'SR',
           'Svalbard And Jan Mayen': 'SJ',
           'Swaziland': 'SZ',
           'Sweden': 'SE',
           'Switzerland': 'CH',
           'Syrian Arab Republic': 'SY',
           'Taiwan': 'TW',
           'Tajikistan': 'TJ',
           'Tanzania': 'TZ',
           'Thailand': 'TH',
           'Timor-Leste': 'TL',
           'Togo': 'TG',
           'Tokelau': 'TK',
           'Tonga': 'TO',
           'Trinidad And Tobago': 'TT',
           'Tunisia': 'TN',
           'Turkey': 'TR',
           'Turkmenistan': 'TM',
           'Turks And Caicos Islands': 'TC',
           'Tuvalu': 'TV',
           'Uganda': 'UG',
           'Ukraine': 'UA',
           'United Arab Emirates': 'AE',
           'United Kingdom': 'GB',
           'United States': 'US',
           'United States Outlying Islands': 'UM',
           'Uruguay': 'UY',
           'Uzbekistan': 'UZ',
           'Vanuatu': 'VU',
           'Venezuela': 'VE',
           'Vietnam': 'VN',
           'Virgin Islands, British': 'VG',
           'Virgin Islands, U.S.': 'VI',
           'Wallis And Futuna': 'WF',
           'Western Sahara': 'EH',
           'Yemen': 'YE',
           'Zambia': 'ZM',
           'Zimbabwe': 'ZW'
       };

});
