// Alleen voor lokaal kiezen: varianten voor de blokken onder de hero, allemaal tegelijk te kiezen.
(function () {
    const groepen = {
        blok: { titel: 'Werkwijze', sectie: 'aanpak', opties: { 1: 'Grote cijfers', 2: 'Rijen', 3: 'Met foto', 4: 'Middelste in roze', 5: 'Rondes' } },
        over: { titel: 'Over mij', sectie: 'over', opties: { 1: 'Volle foto', 2: 'Groot citaat', 3: 'Naam over foto', 4: 'Roze schaduw', 5: 'Balk eronder' } },
        traject: { titel: 'Traject', sectie: 'trajecten', opties: { 1: 'Tijdlijn', 2: 'Rondes', 3: 'Rijen', 4: 'Sessies groot', 5: 'Roze start' } },
        faq: { titel: 'Vragen', sectie: 'faq', opties: { 1: 'Rijen', 2: 'Roze open', 3: 'Nummerblok', 4: 'Grote foto', 5: 'Twee kolommen' } },
        contact: { titel: 'Contact', sectie: 'contact', opties: { 1: 'Volle foto', 2: 'Gesplitst', 3: 'Roze blok', 4: 'Grote kop', 5: 'Harde schaduw' } }
    };
    const fotos = ['linsey-intake.jpg', 'linsey-knee-color.jpg', 'linsey-mirror-color.jpg'];

    const params = new URLSearchParams(location.search);
    const keuze = {};
    // Gekozen door Servé (05-11): werkwijze 1, over mij 1, traject 3, vragen 1, contact 1
    const vast = { blok: '1', over: '1', traject: '3', faq: '1', contact: '1' };
    for (const [k, g] of Object.entries(groepen)) keuze[k] = g.opties[params.get(k)] ? params.get(k) : vast[k];

    document.addEventListener('DOMContentLoaded', () => {
        // Hoe we werken
        const aanpak = document.getElementById('aanpak');
        if (aanpak && keuze.blok !== '0') {
            aanpak.classList.add('blok', 'blok-' + keuze.blok);
            aanpak.querySelectorAll('.approach-card').forEach((kaart, i) => {
                const num = kaart.querySelector('.card-num');
                if (keuze.blok === '3') kaart.insertAdjacentHTML('afterbegin', `<div class="blok-foto"><img src="assets/images/site/${fotos[i]}" alt="" loading="lazy"></div>`);
                if (keuze.blok === '5' && num) num.innerHTML = `<span>Ronde</span>${num.textContent}`;
            });
        }

        // Over mij
        const over = document.getElementById('over');
        if (over && keuze.over !== '0') {
            over.classList.add('ov', 'ov-' + keuze.over);
            if (keuze.over === '3') {
                over.querySelector('.about-image-wrap').insertAdjacentHTML('beforeend', '<div class="ov-naam" aria-hidden="true">Linsey<br>Klaus</div>');
            }
            if (keuze.over === '5') {
                over.appendChild(over.querySelector('.about-features'));
            }
        }

        // Traject op maat
        const traject = document.getElementById('trajecten');
        if (traject && keuze.traject !== '0') {
            traject.classList.add('tr', 'tr-' + keuze.traject);
            traject.querySelectorAll('.story-step').forEach(stap => {
                const [nr, naam] = stap.textContent.split('·').map(t => t.trim());
                stap.innerHTML = keuze.traject === '2'
                    ? `<b><span>Ronde</span>${nr}</b><em>${naam}</em>`
                    : `<b>${nr}</b><em>${naam}</em>`;
            });
            if (keuze.traject === '4') {
                const lijst = traject.querySelector('.story-inline-list');
                const tegels = [...lijst.children].map(s => {
                    const [n, ...rest] = s.textContent.trim().split(' ');
                    return `<div><b>${n}</b><span>${rest.join(' ')}</span></div>`;
                }).join('');
                traject.querySelector('.story-header').insertAdjacentHTML('afterend', `<div class="tr-tegels">${tegels}</div>`);
            }
        }

        // Vragen en contact
        const faq = document.getElementById('faq');
        if (faq && keuze.faq !== '0') faq.classList.add('fq', 'fq-' + keuze.faq);
        const contact = document.getElementById('contact');
        if (contact && keuze.contact !== '0') contact.classList.add('ct', 'ct-' + keuze.contact);

        // Tijdelijk: vijf overlay-varianten voor het contactblok
        const cvNamen = { 1: 'Zwaar links', 2: 'Effen vlak', 3: 'Roze gloed', 4: 'Foto alleen rechts', 5: 'Glas' };
        const cv = cvNamen[params.get('cv')] ? params.get('cv') : '5'; // gekozen: Glas (05-11)
        if (contact && cv !== '0') contact.classList.add('cv-' + cv);
        // Keuzebalk weg na de keuze van Servé.

        // Keuzebalk weg na de keuze van Servé.
    });
})();
