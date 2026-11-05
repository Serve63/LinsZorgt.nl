// Alleen voor lokaal kiezen: wisselt de hero tussen de huidige versie en vijf opties.
(function () {
    const hero = document.querySelector('section.hero');
    if (!hero) return;

    const img = 'assets/images/site/';
    const eyebrow = 'Bokscoaching &amp; Therapie';
    const titel = '<span class="hero-line">VOOR WIE VASTLOOPT EN VIA</span><span class="hero-line accent">ACTIE WIL VERANDEREN!</span>';
    const sub = 'Mentale coaching en fysieke training in één. Voor stress, burn-out, motivatieproblemen en gebrek aan zelfvertrouwen. We werken niet alleen met woorden, maar met beweging.';
    const knoppen = '<div class="hero-actions"><a href="#contact" class="btn magnetic">Start direct</a><a href="#aanpak" class="btn outline magnetic">Bekijk aanpak</a></div>';
    const stats = '<div class="ho-stats">'
        + '<div><b>1-op-1</b><span>Persoonlijke setting</span></div>'
        + '<div><b>60min</b><span>Per sessie</span></div>'
        + '<div><b>Flexibel</b><span>Aan huis, buiten of Reeshof</span></div></div>';
    const quote = '<blockquote class="ho-quote">"Onder druk zie je wie je bent — en waar beweging nodig is."<cite>— LinsZorgT</cite></blockquote>';
    const tekst = `<div class="eyebrow">${eyebrow}</div><h1>${titel}</h1><p class="hero-subtitle">${sub}</p>${knoppen}`;

    const opties = {
        1: {
            naam: 'Volle foto',
            html: `<div class="ho-bg"><img src="${img}linsey-bag-color.jpg" alt="Bokssessie met bokszakken" fetchpriority="high"></div>
                <div class="ho-inner">${tekst}</div>
                BALK`
        },
        2: {
            naam: 'Gesplitst',
            html: `<div class="ho-inner">${tekst}</div>
                <div class="ho-photo"><img src="${img}linsey-knee-color.jpg" alt="Bokscoaching in actie" fetchpriority="high">${quote}</div>
                ${stats}`
        },
        3: {
            naam: 'Groot statement',
            html: `<div class="ho-inner">${tekst}</div>
                <div class="ho-strip">
                    <img src="${img}linsey-intake.jpg" alt="Intakegesprek aan tafel" loading="lazy">
                    <img src="${img}linsey-bag-color.jpg" alt="Bokssessie met bokszakken" fetchpriority="high">
                    <img src="${img}linsey-mirror-color.jpg" alt="Training met handen omhoog" loading="lazy">
                </div>
                ${stats}`
        },
        4: {
            naam: 'Boog met badge',
            html: `<div class="ho-inner">${tekst}${stats}</div>
                <div class="ho-arch">
                    <div class="ho-arch-img"><img src="${img}linsey-34-color.jpg" alt="Coaching op de mat" fetchpriority="high"></div>
                    <svg class="ho-badge" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ho-cirkel" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs><text><textPath href="#ho-cirkel">BEWEGEN · ONTDEKKEN · STAPPEN ZETTEN · </textPath></text><circle cx="100" cy="100" r="34"/></svg>
                    ${quote}
                </div>`
        },
        5: {
            naam: 'Mozaïek',
            html: `<div class="ho-inner">${tekst}${stats}</div>
                <div class="ho-mozaiek">
                    <img class="m1" src="${img}linsey-bag-color.jpg" alt="Bokssessie met bokszakken" fetchpriority="high">
                    <img class="m2" src="${img}linsey-knee-color.jpg" alt="Bokscoaching in actie" loading="lazy">
                    <img class="m3" src="${img}linsey-intake.jpg" alt="Intakegesprek aan tafel" loading="lazy">
                </div>`
        }
    };

    const woorden = ['Bokscoaching', 'Therapie', 'Stress', 'Burn-out', 'Motivatie', 'Zelfvertrouwen', 'Bewegen', 'Ontdekken', 'Stappen zetten'];
    const rij = woorden.map(w => `<span>${w}</span><i aria-hidden="true">✦</i>`).join('');
    const icoon = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
    const balken = {
        1: { naam: 'Donker', html: `<div class="ho-band">${stats}<p class="ho-band-slogan">Bewegen · Ontdekken · Stappen zetten</p></div>` },
        2: { naam: 'Roze', html: `<div class="ho-band ho-band--roze">${stats}<p class="ho-band-slogan">Bewegen · Ontdekken · Stappen zetten</p></div>` },
        3: { naam: 'Bewegend', html: `<div class="ho-band ho-band--marquee" aria-label="${woorden.join(', ')}"><div class="ho-marquee"><div>${rij}</div><div aria-hidden="true">${rij}</div></div></div>` },
        4: { naam: 'Iconen', html: `<div class="ho-band ho-band--iconen">
                <div>${icoon('<circle cx="8" cy="8" r="3.2"/><circle cx="16" cy="8" r="3.2"/><path d="M2.5 20c.6-3.6 2.8-5.6 5.5-5.6s4.9 2 5.5 5.6M10.5 20c.6-3.6 2.8-5.6 5.5-5.6s4.9 2 5.5 5.6"/>')}<p><b>1-op-1</b><span>Persoonlijke setting</span></p></div>
                <div>${icoon('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>')}<p><b>60 minuten</b><span>Per sessie</span></p></div>
                <div>${icoon('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>')}<p><b>Flexibel</b><span>Aan huis, buiten of Reeshof</span></p></div>
            </div>` },
        5: { naam: 'Zwevende kaart', html: `<div class="ho-band ho-band--kaart">${stats}</div>` }
    };

    const params = new URLSearchParams(location.search);
    const gekozen = params.get('optie') || '1';
    const balkKeuze = balken[params.get('balk')] ? params.get('balk') : '3';
    if (opties[gekozen]) {
        hero.className = 'hero ho ho-' + gekozen + ' ho-balk-' + balkKeuze;
        hero.innerHTML = opties[gekozen].html.replace('BALK', balkKeuze === '5' ? balken[5].html : '');
        if (gekozen === '1' && balkKeuze !== '5') {
            // Balk los onder de hero, over de volle breedte
            hero.insertAdjacentHTML('afterend', balken[balkKeuze].html.replace('class="ho-band', 'class="ho-band ho-band--los'));
        }
    }

    // Keuzebalk weg: Servé koos optie 1 met balk C (05-11).
})();
