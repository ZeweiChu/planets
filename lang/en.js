(window.I18N = window.I18N || {})["en"] = {
meta: {name: "English", html: "en", dir: "ltr", font: "latin", num: "en-US", labelW: "10.5em", layerW: "7.5em", latinNames: true},
ui: {
  title: "Standing on Other Worlds",
  langLabel: "Language",
  stripLabel: "Choose a planet",
  scaleNote: "Tap any planet to switch. Ordered outward from the Sun. Sizes are compressed (square root of diameter): at true scale, Jupiter is about 11 times wider than Earth.",
  photosOf: "Photos of {name}",
  panoHint: "← Drag to look around →",
  panoLabel: "Panorama, scroll sideways",
  switchPhoto: "Switch photo",
  imageCredit: "Image: {c}",
  glance: "{name} at a glance",
  statGravity: "Gravity",
  statEarth1: "Earth = 1",
  statTemp: "Mean temperature",
  statPressure: "Surface pressure",
  statDensity: "Mean density",
  statDensityNote: "kg/m³ (water is 1,000)",
  statDay: "Day",
  statYear: "Year",
  moonsOne: "{n} moon",
  moonsOther: "{n} moons",
  magYes: "global magnetic field",
  magNo: "no global magnetic field",
  cardGround: "Underfoot",
  cardAir: "What's in the air",
  cardGravity: "Gravity",
  cardWhy: "Why it's like this",
  standHere: "Standing here",
  layersTop: "↑ Outer layers",
  layersBottom: "Hotter and denser with depth ↓",
  other: "Other",
  trace: "Trace gases:",
  listSep: "; ",
  gAccel: "Surface gravity",
  gUnit: "m/s², {r}× Earth",
  gFelt: "You would feel like you weigh",
  gJump: "A 50 cm jump on Earth becomes",
  gWeight: "Your weight",
  gCloud: "(At the 1-bar cloud level, assuming you had somewhere to stand.)",
  cmpTitle: "All eight side by side",
  cmpSub: "Click any row to switch to that planet. Giant planets have no ground, so their gravity and temperature are given at the 1-bar level.",
  colPlanet: "Planet",
  colType: "Type",
  colGround: "Underfoot",
  colGases: "Main gases",
  colGravity: "Gravity (× Earth)",
  colTemp: "Mean temp. (°C)",
  colPressure: "Surface pressure (bar)",
  colEscape: "Escape velocity (km/s)",
  nearVacuum: "Near vacuum (sodium, magnesium atoms)",
  bigTitle: "Two rules explain most of the differences",
  bigSub: "The eight planets look wildly different, but most of what their surfaces and air are like can be worked out from two simple pieces of physics.",
  l1Title: "1. Why are the inner planets rocky and the outer ones gas?",
  l1p1: "Planets formed in a disk of gas and dust circling the young Sun. Close to the Sun it was too hot for anything but rock and metal to condense into solids, so there was little raw material, and the planets that grew there are small and dense.",
  l1p2: "Beyond the “frost line” (roughly between today's Mars and Jupiter), water, ammonia and methane could freeze too, multiplying the solid material several times over. Once a core reached about 10 Earth masses, its gravity was strong enough to swallow the surrounding hydrogen and helium directly, and it snowballed into Jupiter or Saturn. Uranus and Neptune formed farther out, where material was sparse and growth was slow. By the time they were big, little gas was left in the disk, so they are made mostly of “ices” rather than hydrogen and helium.",
  frostLine: "Frost line",
  frostIn: "Inside: only rock and metal are solid",
  frostOut: "Outside: water, ammonia and methane freeze too",
  grpRocky: "Rocky planets",
  grpRockyNote: "Little material, small and dense",
  grpGas: "Gas giants",
  grpGasNote: "Icy cores grabbed H and He",
  grpIce: "Ice giants",
  grpIceNote: "Formed late, less gas left",
  notToScale: "Diagram: distances and sizes not to scale",
  frostAria: "Frost line diagram: rocky planets inside the frost line, gas giants and ice giants outside it",
  l2Title: "2. Who gets to keep an atmosphere?",
  l2p1: "Gas molecules are always zipping around: the hotter the gas and the lighter the molecule, the faster they move. At the same temperature, hydrogen molecules move 4.7 times faster than carbon dioxide.",
  l2p2: "A rule of thumb: if a planet's escape velocity is more than about 6 times a molecule's average speed, the planet can hold on to that gas for billions of years. Drag the temperature to see which gases each planet can keep.",
  tempLabel: "Upper-atmosphere temperature",
  tempOut: "{t} K (about {c} °C)",
  escAxis: "Planet escape velocity (km/s, log scale) · colored lines = minimum escape velocity to keep that gas",
  keepAll: "Keeps everything, even hydrogen",
  keepNone: "Keeps none of them",
  keepSome: "Keeps {list}",
  legend: "At {t} K, the escape velocity needed to keep each gas: {list} km/s. A dot to the right of a line keeps that gas.",
  dotTitle: "{name}: escape velocity {v} km/s",
  escAria: "Each planet's escape velocity compared with the speed needed to keep different gases",
  l2fine: "The temperature here means the very top of the atmosphere, where gas actually escapes into space, and it is often much hotter than the ground: Earth's upper atmosphere can reach about 1,000 K. This is a simplified model. The solar wind and chemical reactions also remove air, as Mars shows.",
  srcTitle: "Sources",
  sources: [
    "Gravity, temperature, pressure, density, escape velocity, moons: <a href=\"https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html\">NASA NSSDC Planetary Fact Sheet</a> (updated March 2025)",
    "Atmospheric composition: NASA NSSDC per-planet fact sheets, see the <a href=\"https://nssdc.gsfc.nasa.gov/planetary/planetfact.html\">fact sheet index</a>",
    "True colors of Neptune and Uranus: <a href=\"https://skyatnightmagazine.com/news/images-uranus-neptune-true-colours\">coverage of Irwin et al., 2024</a>",
    "Photos: NASA <a href=\"https://science.nasa.gov/photojournal/\">Photojournal</a>, NASA NSSDC (Venera 13), NASA Scientific Visualization Studio (Blue Marble). Each photo's source and ID appear below it. NASA images are used under NASA's media guidelines; the Juno close-up's processing is CC BY-NC-SA.",
    "Surface materials and the “why” explanations summarize published results from MESSENGER, Venera, Viking, MAVEN, Juno and other missions, simplified."
  ]
},
planets: {
  mercury: {
    name: "Mercury", kind: "Rocky planet",
    tNote: "Sunlit side 317–452 °C; the night side drops well below −100 °C",
    pNote: "< 5×10⁻¹⁵ bar, essentially a vacuum",
    day: "176 Earth days", dayNote: "From one sunrise to the next", year: "88 days",
    hook: "A ball of iron with almost no air: baked by day, frozen by night.",
    surface: "Solid rock surface",
    groundQ: "Gray, crater-covered rock that looks a lot like the Moon.",
    items: [
      ["Silicate rock", "The main surface rock, the same family as the rocks of Earth and the Moon"],
      ["Sulfur", "Surprisingly abundant, an unexpected finding by the MESSENGER spacecraft"],
      ["Water ice", "Hidden in polar craters that never see sunlight"],
      ["Huge iron core", "About 80% of the planet's radius, which is why Mercury is so dense"]
    ],
    airQ: "Almost no air, just a thin spray of atoms knocked off the ground.",
    airNote: "The solar wind and micrometeorites keep blasting atoms off the surface, forming an extremely thin exosphere. The most common are sodium, magnesium and oxygen.",
    why: [
      ["Why is there almost no air?", "Mercury is small, with an escape velocity of just 4.3 km/s, and it sits close to the Sun where it is hot, so gas molecules move fast and escape easily."],
      ["Why is the day–night swing so extreme?", "With no air to hold heat, the warmth soaked up by day radiates straight back into space at night."],
      ["Why is it so dense?", "It has an oversized iron core. One explanation: a giant impact early on stripped away much of its rocky outer layer."]
    ],
    stand: "The sky is black, because there is no air to scatter sunlight, and the Sun looks about 2.6 times bigger than it does from Earth.",
    tableSurface: "Rock"
  },
  venus: {
    name: "Venus", kind: "Rocky planet",
    tNote: "Almost no difference between day and night",
    pNote: "Like the water pressure 900 m below the ocean surface",
    day: "117 Earth days", dayNote: "One spin takes 243 days, and it turns backwards", year: "225 days",
    hook: "At 464 °C, its surface is hotter than Mercury's, even though Mercury is closer to the Sun.",
    surface: "Solid rock surface",
    groundQ: "Vast lava plains dotted with volcanoes.",
    items: [
      ["Basalt", "Rock formed from cooled lava, the same kind as the rock of Hawaii"],
      ["Lava plains", "Cover most of the surface; Soviet Venera landers photographed flat, slab-like rocks"],
      ["No liquid water", "The surface is far hotter than water's boiling point"]
    ],
    airQ: "Thick carbon dioxide, wrapped in clouds of sulfuric acid.",
    airNote: "The clouds are droplets of sulfuric acid (H₂SO₄). They cover the whole planet all the time, so you can never see the ground from outside.",
    why: [
      ["Why is it hotter than Mercury?", "92 bar of carbon dioxide traps the heat: sunlight gets in, but the infrared heat given off by the ground can't get out. This is a runaway greenhouse effect."],
      ["Why didn't Earth end up like this?", "Earth's carbon dioxide didn't vanish. The oceans dissolved it and turned it into limestone and other carbonate rocks locked underground. Venus has no oceans, so all its carbon dioxide stayed in the air."],
      ["Why is night as hot as day?", "An atmosphere this thick acts like a giant blanket, spreading heat evenly around the whole planet."]
    ],
    stand: "You would be crushed, cooked and corroded at the same time. The longest any Soviet lander lasted on the surface was about two hours.",
    tableSurface: "Rock"
  },
  earth: {
    name: "Earth", kind: "Rocky planet",
    tNote: "Global average; typically 10–20 °C between day and night",
    pNote: "At sea level",
    day: "24 hours", dayNote: "", year: "365 days",
    hook: "The only world we know with liquid oceans on its surface and plenty of oxygen in its air.",
    surface: "Solid rock + liquid oceans",
    groundQ: "A rocky crust, about 71% covered by liquid water.",
    items: [
      ["Silicate rock", "Granite builds the continents, basalt the ocean floor"],
      ["Liquid water", "Covers about 71% of the surface"],
      ["Carbonate rock", "Limestone and similar rocks lock away huge amounts of carbon dioxide"],
      ["Soil and life", "Living things helped shape both the ground and the air"]
    ],
    airQ: "Mostly nitrogen, one-fifth oxygen.",
    airNote: "Plus about 1% water vapor, which varies a lot with the weather.",
    why: [
      ["Why 21% oxygen?", "Life made it. Photosynthesis by plants and algae keeps releasing oxygen. Oxygen is very reactive, so without life constantly topping it up, it would slowly react with rocks and disappear."],
      ["Why mostly nitrogen?", "The nitrogen molecule is extremely stable, barely reacts, and is too heavy to escape, so nitrogen released by volcanoes has built up in the air for billions of years."],
      ["Why does water stay liquid?", "The distance from the Sun is just right, and a moderate greenhouse effect keeps most of the surface between 0 and 100 °C, with enough air pressure too."]
    ],
    stand: "This is the reference point your body is built for: every “times Earth” on this site counts Earth as 1.",
    tableSurface: "Rock + oceans"
  },
  mars: {
    name: "Mars", kind: "Rocky planet",
    tNote: "At the Viking 1 lander site: −89 to −31 °C over a day",
    pNote: "6.36 millibars, about 0.6% of Earth's",
    day: "24.7 hours", dayNote: "", year: "687 days",
    hook: "A cold, rusty desert where the air is too thin for water to stay liquid.",
    surface: "Solid rock surface",
    groundQ: "A rocky desert under red dust, with the solar system's tallest volcano and ancient river channels.",
    items: [
      ["Basalt", "Volcanic rock, like the rock of Earth's ocean floor"],
      ["Iron oxide", "In other words rust, which turns the dust and the sky red"],
      ["Perchlorates", "A kind of salt in the soil that is harmful to humans"],
      ["Polar caps", "Water ice, covered in winter by a layer of frozen carbon dioxide (dry ice)"]
    ],
    airQ: "Thin carbon dioxide, with almost no oxygen.",
    airNote: "Winds can whip up planet-wide dust storms; the Viking landers measured storm winds of 17–30 m/s.",
    why: [
      ["Why is it red?", "The dust is rich in iron oxide, which is rust. Fine dust blown into the air turns even the daytime sky yellow-brown."],
      ["Why is the air so thin?", "Mars is small with weak gravity, and it lost its global magnetic field early on, so the solar wind has been stripping its atmosphere away into space. NASA's MAVEN orbiter has measured this happening."],
      ["Why is there no liquid water?", "The average pressure, 6.36 millibars, is almost exactly water's triple point (about 6.1 millibars). At this pressure, ice tends to turn straight into vapor, skipping the liquid stage."]
    ],
    stand: "The pressure is so low that your body fluids would boil. Without a pressure suit, you would pass out within seconds.",
    tableSurface: "Rock"
  },
  jupiter: {
    name: "Jupiter", kind: "Gas giant",
    tNote: "At the 1-bar level; it gets hotter deeper down",
    pNote: "No ground; pressure keeps rising with depth, past 1,000 bar",
    day: "9.9 hours", dayNote: "", year: "11.9 years",
    hook: "A planet with no ground: fall in, and the gas slowly turns into liquid around you.",
    surface: "No solid surface",
    groundQ: "There is no ground. Gravity and temperature are measured at the 1-bar level, the same pressure as sea level on Earth.",
    layers: [
      ["Top clouds", "Ammonia ice"],
      ["Mid clouds", "Ammonium hydrosulfide (NH₄SH)"],
      ["Deep clouds", "Water ice"],
      ["Further down", "Hydrogen squeezed into a liquid, and deeper still into electrically conducting metallic hydrogen"],
      ["Center", "Possibly a fuzzy-edged core of heavy elements"]
    ],
    airQ: "Hydrogen and helium, much like the Sun.",
    airNote: "",
    why: [
      ["How does it keep hydrogen, the lightest gas?", "Its escape velocity is 59.5 km/s and its cloud tops are cold, so even the fastest hydrogen molecules can't get away. That's why Jupiter is made of almost the same stuff as the Sun: hydrogen and helium."],
      ["Why is there no ground?", "Deeper down the gas gets hotter and denser until it gradually becomes liquid, with no clear boundary you could stand on."],
      ["Why the stripes?", "A Jupiter day is under 10 hours. That fast spin stretches the clouds into east–west bands, and clouds at different heights and of different makeup give the bands their shades."]
    ],
    stand: "At the 1-bar level, gravity is 2.4 times Earth's. The Great Red Spot alone is a storm wider than the whole Earth.",
    tableSurface: "None (gas → liquid)"
  },
  saturn: {
    name: "Saturn", kind: "Gas giant",
    tNote: "At the 1-bar level",
    pNote: "No ground; past 1,000 bar deep down",
    day: "10.7 hours", dayNote: "", year: "29.4 years",
    hook: "Less dense than water: given a big enough bathtub, it would float.",
    surface: "No solid surface",
    groundQ: "Like Jupiter, it has no ground. Its rings are mostly grains of water ice, from dust-sized up to as big as houses.",
    layers: [
      ["Clouds", "Ammonia ice, ammonium hydrosulfide, water ice"],
      ["Further down", "Liquid hydrogen, and deeper still metallic hydrogen"],
      ["Center", "A core of rock and ice"]
    ],
    airQ: "Almost all hydrogen, with far less helium than Jupiter.",
    airNote: "",
    why: [
      ["How could it float on water?", "Its average density is just 687 kg/m³, less than water's 1,000, because it is mostly light hydrogen and helium."],
      ["Why does it have rings?", "The ice grains are so close to Saturn that its tides pull them apart, so they can't clump into a moon and stay spread out as rings."],
      ["Why less helium than Jupiter?", "A leading explanation: Saturn's interior is cooler, so helium rains down toward the depths, leaving less of it in the upper atmosphere."]
    ],
    stand: "At the 1-bar level, gravity is about the same as Earth's (0.92×), but winds reach 400 m/s, several times faster than Earth's strongest hurricanes.",
    tableSurface: "None (gas → liquid)"
  },
  uranus: {
    name: "Uranus", kind: "Ice giant",
    tNote: "At the 1-bar level",
    pNote: "No ground; far beyond 1,000 bar deep down",
    day: "17.2 hours", dayNote: "", year: "84 years",
    hook: "An ice giant that spins on its side, so each pole takes turns with decades of daylight and decades of night.",
    surface: "No solid surface",
    groundQ: "There is no ground. Under the atmosphere lies a hot, thick layer of “ices”.",
    layers: [
      ["Clouds", "Ammonia ice, ammonium hydrosulfide, water ice, maybe methane ice"],
      ["Atmosphere", "Hydrogen and helium, plus the methane that tints it blue-green"],
      ["Mantle", "A hot, dense, high-pressure fluid of water, ammonia and methane, which astronomers call “ices”"],
      ["Center", "A small rocky core"]
    ],
    airQ: "Hydrogen and helium, plus 2.3% methane.",
    airNote: "",
    why: [
      ["Why is it blue-green?", "Methane in the atmosphere absorbs the red part of sunlight, so mostly blue-green light is reflected back."],
      ["Why call it an ice giant?", "Most of it isn't hydrogen and helium but water, ammonia and methane, which astronomers call “ices”. Under the heat and pressure inside, they are actually a hot, thick fluid, not blocks of ice."],
      ["Why does it spin on its side?", "Its axis is tilted 97.8°, so it is almost lying down. The leading explanation is a giant collision early in its history."]
    ],
    stand: "Gravity is only 0.89 times Earth's, and the air is about −195 °C. One year lasts 84 Earth years, so each pole gets decades of continuous daylight, then decades of darkness.",
    tableSurface: "None (“ice” fluid)"
  },
  neptune: {
    name: "Neptune", kind: "Ice giant",
    tNote: "At the 1-bar level",
    pNote: "No ground; far beyond 1,000 bar deep down",
    day: "16.1 hours", dayNote: "", year: "164 years",
    hook: "The farthest planet from the Sun, yet the windiest: gusts up to 580 m/s, faster than the speed of sound on Earth.",
    surface: "No solid surface",
    groundQ: "Like Uranus: under the atmosphere lies a hot, dense “ice” fluid.",
    layers: [
      ["Clouds", "Ammonia ice, ammonium hydrosulfide, water ice, maybe methane ice"],
      ["Atmosphere", "Hydrogen, helium and methane"],
      ["Mantle", "A hot, dense, high-pressure fluid of water, ammonia and methane"],
      ["Center", "A small rocky core"]
    ],
    airQ: "Hydrogen and helium, plus 1.5% methane.",
    airNote: "",
    why: [
      ["Why is the farthest planet the windiest?", "Neptune still releases a lot of heat from inside, which churns the atmosphere from below, and with no ground to create friction, the winds keep building."],
      ["Is it really deep blue?", "No. In 2024, Oxford researchers reprocessed the data and found Neptune is a pale blue-green, only slightly bluer than Uranus. The famous Voyager 2 picture had been enhanced."],
      ["Why slightly bluer than Uranus?", "Both get their color from methane absorbing red light. Researchers think Neptune's haze layer is thinner, so its color looks a little deeper."]
    ],
    stand: "Gravity is 1.1 times Earth's. From here, the Sun is just an exceptionally bright star in the sky.",
    tableSurface: "None (“ice” fluid)"
  }
},
fun: {
  mercury: "One day on Mercury, from sunrise to the next sunrise, lasts 176 Earth days, twice its 88-day year. Waiting there from sunrise to sunset takes a whole year.",
  venus: "On Venus the Sun rises in the west. It spins the opposite way from Earth, and so slowly that one turn takes 243 days, longer than its 225-day trip around the Sun.",
  earth: "Earth is the densest of the eight planets, averaging 5.5 tonnes per cubic meter. Nearly all the oxygen you are breathing was made, bit by bit, by life over billions of years.",
  mars: "Sunsets on Mars are blue, while the daytime sky is yellow-brown. Both come from the same thing: fine dust floating in the air.",
  jupiter: "Jupiter's Great Red Spot is a single storm wider than the whole Earth. People have watched it through telescopes for at least 150 years, and it still hasn't stopped.",
  saturn: "Saturn's rings span more than 200,000 km, yet most of them are only about 10 meters thick. At that ratio, they are like a sheet of printer paper two or three kilometers wide.",
  uranus: "Uranus rolls around the Sun almost on its side. Each pole gets more than 40 years of continuous daylight, followed by more than 40 years of night.",
  neptune: "Neptune was discovered in 1846 and only finished its first orbit since then in 2011. Its winds reach 580 m/s, faster than the speed of sound on Earth."
},
photos: {
  mercury: [
    {t: "Mercury, photographed by MESSENGER", d: "The colors are enhanced: different colors mark rocks of different makeup. To the naked eye, Mercury would look like a dark gray ball.", b: "Enhanced color"}
  ],
  venus: [
    {t: "The surface of Venus, March 1, 1982", d: "The Soviet Venera 13 lander survived 2 hours 7 minutes on a 464 °C, 92-bar surface and sent back this panorama: flat slabs of rock, with the saw-toothed edge of the lander itself at the bottom. The orange tint comes from the thick atmosphere filtering out blue light.", b: "Surface photo"},
    {t: "Mariner 10 flies past Venus, February 1974", d: "From outside, all you can see is sulfuric-acid cloud, never the ground. This image combines orange and ultraviolet pictures, so the colors aren't what your eye would see.", b: "False color"}
  ],
  earth: [
    {t: "“The Blue Marble”, December 7, 1972", d: "Apollo 17 astronauts photographed Earth on their way to the Moon: Africa and the Arabian Peninsula at the top, Antarctica in white at the bottom.", b: "True color"}
  ],
  mars: [
    {t: "Perseverance's first 360° panorama, February 2021", d: "Taken on the floor of Jezero Crater and stitched from 142 images. Drag to look all the way around: the distant ridge is the crater rim, and the foreground is the rover's own deck.", b: "Surface photo"},
    {t: "A blue sunset on Mars, April 15, 2015", d: "Taken by Curiosity in Gale Crater. The sky around the Sun is blue because fine Martian dust lets blue light keep traveling in the Sun's direction more than other colors. The camera sees color much like the human eye, just a bit less sensitive to blue.", b: "Near-true color"},
    {t: "Mars from orbit", d: "A mosaic of 102 images from the Viking 1 orbiter (in orbit 1976–1980). The great gash across the middle is Valles Marineris, over 4,000 km long; the three dark dots on the left are giant volcanoes.", b: "Mosaic"}
  ],
  jupiter: [
    {t: "Skimming Jupiter's cloud tops, December 16, 2017", d: "Juno captured these churning northern cloud bands from about 13,000 km above the cloud tops. Citizen scientists processed the image and boosted its color and contrast; the real Jupiter looks much softer.", b: "Enhanced color"},
    {t: "Jupiter, photographed by Cassini, December 2000", d: "Assembled from 27 images, with colors close to what the eye would see. The oval in the lower half is the Great Red Spot, a storm wider than Earth.", b: "Near-true color"}
  ],
  saturn: [
    {t: "Saturn, photographed by Cassini, October 2004", d: "A natural-color view stitched from 126 images: red, green and blue shots at each of 42 positions. Notice the shadows the rings cast on the planet.", b: "True color"},
    {t: "Saturn backlit by the Sun, July 19, 2013", d: "With the Sun hidden behind Saturn, the rings light up from behind, revealing faint outer rings that are hard to see otherwise. Earth is in this picture too, as a barely visible dot.", b: "True color"}
  ],
  uranus: [
    {t: "Voyager 2 looks back at Uranus, January 25, 1986", d: "As it left, the spacecraft captured this crescent from about a million kilometers away. The pale blue-green comes from methane in the air absorbing red light. Voyager 2 is still the only spacecraft to have visited Uranus.", b: "Near-true color"}
  ],
  neptune: [
    {t: "Neptune's clouds, August 1989", d: "A close-up from Voyager 2, processed for true color balance; the white streaks are high-altitude clouds. A 2024 study, though, suggests Neptune's real color is even paler than this.", b: "Near-true color"}
  ]
},
gas: {
  CO2: "carbon dioxide", N2: "nitrogen", O2: "oxygen", Ar: "argon", CO: "carbon monoxide", H2: "hydrogen", He: "helium",
  CH4: "methane", H2O: "water vapor", SO2: "sulfur dioxide", Ne: "neon", NH3: "ammonia", HD: "hydrogen deuteride",
  C2H6: "ethane", NO: "nitric oxide", Na: "sodium atoms", Mg: "magnesium atoms", O: "oxygen atoms", H: "hydrogen atoms",
  K: "potassium atoms", Ca: "calcium atoms"
}
};
