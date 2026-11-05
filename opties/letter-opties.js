// Alleen voor lokaal kiezen: wisselt het kopletter (nu Oswald) voor vijf andere lettertypes.
(function () {
    const strak = 'h1,h2{letter-spacing:-.01em;line-height:.98} .hero h1{font-size:clamp(2.6rem,5.4vw,5rem)}';
    const opties = {
        1: { naam: 'Archivo smal', font: 'Archivo', url: 'Archivo:ital,wdth,wght@1,62..125,100..900', gewicht: 900, stijl: 'italic', breedte: '62%', extra: strak },
        2: { naam: 'Kanit', font: 'Kanit', url: 'Kanit:ital,wght@1,800', gewicht: 800, stijl: 'italic', extra: 'h1,h2{letter-spacing:-.015em;line-height:1} .hero h1{font-size:clamp(2.3rem,4.6vw,4.3rem)}' },
        3: { naam: 'Barlow + omlijnd', font: 'Barlow Condensed', url: 'Barlow+Condensed:ital,wght@1,800', gewicht: 800, stijl: 'italic',
             extra: strak + ' .hero-line.accent{color:transparent!important;-webkit-text-stroke:1.6px var(--accent);paint-order:stroke}' },
        4: { naam: 'Saira smal', font: 'Saira', url: 'Saira:ital,wdth,wght@1,50..125,100..900', gewicht: 900, stijl: 'italic', breedte: '58%', extra: strak },
        5: { naam: 'Stencil', font: 'Big Shoulders Stencil Display', url: 'Big+Shoulders+Stencil+Display:wght@900', gewicht: 900, stijl: 'oblique 9deg',
             extra: 'h1,h2{letter-spacing:.005em;line-height:.95} .hero h1{font-size:clamp(2.7rem,5.6vw,5.3rem)}' }
    };

    const params = new URLSearchParams(location.search);
    const gekozen = opties[params.get('letter')] ? params.get('letter') : '3';
    const o = opties[gekozen];

    if (o) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${o.url}&display=swap`;
        document.head.appendChild(link);

        // Overal waar Oswald staat het gekozen lettertype zetten
        const vervang = regels => {
            for (const r of regels) {
                if (r.cssRules) vervang(r.cssRules);
                if (r.style && /Oswald/.test(r.style.fontFamily)) {
                    r.style.fontFamily = `"${o.font}", sans-serif`;
                    r.style.fontWeight = o.gewicht;
                    if (o.stijl) r.style.fontStyle = o.stijl;
                    if (o.breedte) r.style.fontStretch = o.breedte;
                }
            }
        };
        const pas = () => { for (const s of document.styleSheets) { try { vervang(s.cssRules); } catch (e) {} } };
        pas();
        window.addEventListener('load', pas);

        const extra = document.createElement('style');
        extra.textContent = o.extra;
        document.head.appendChild(extra);
    }

    // Keuzebalk weg: Servé koos optie 3, Barlow + omlijnd (05-11).
})();
