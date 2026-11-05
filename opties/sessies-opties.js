// Alleen voor lokaal kiezen: vijf manieren om de intake-tekst en 5/10/20 sessies te tonen.
(function () {
    const opties = { 1: 'Tegels naast tekst', 2: 'In stap 02', 3: 'Roze balk eronder', 4: 'Kaart ernaast', 5: 'Grote cijfers' };
    const params = new URLSearchParams(location.search);
    // Gekozen door Servé (05-11): optie 1, zonder de intake-zin
    const gekozen = opties[params.get('sessies')] ? params.get('sessies') : '1';

    document.addEventListener('DOMContentLoaded', () => {
        const sectie = document.getElementById('trajecten');
        if (sectie && gekozen !== '0') {
            const kop = sectie.querySelector('.story-header');
            const copy = kop.querySelector('.story-copy');
            const alinea = copy.querySelectorAll('p')[1];
            const lijst = alinea.querySelector('.story-inline-list');
            const sessies = [...lijst.children].map(s => s.textContent.trim().split(' ')[0]);
            const intake = alinea.textContent.split('Veel mensen')[0].trim();
            const tegels = sessies.map(n => `<div><b>${n}</b><span>sessies</span></div>`).join('');

            sectie.classList.add('ss', 'ss-' + gekozen);
            alinea.remove();

            if (gekozen === '1') {
                kop.insertAdjacentHTML('beforeend', `<div class="ss-blok"><div class="ss-label">Veel mensen kiezen bijvoorbeeld voor</div><div class="ss-tegels">${tegels}</div></div>`);
            }
            if (gekozen === '2') {
                const stap = sectie.querySelectorAll('.story-card')[1].querySelector('.story-body');
                stap.insertAdjacentHTML('beforeend', `<div class="ss-chips"><span>Veel kiezen voor</span>${sessies.map(n => `<em>${n} sessies</em>`).join('')}</div>`);
                copy.insertAdjacentHTML('beforeend', `<p>${intake}</p>`);
            }
            if (gekozen === '3') {
                copy.insertAdjacentHTML('beforeend', `<p>${intake}</p>`);
                sectie.querySelector('.story-scroll').insertAdjacentHTML('afterend', `<div class="ss-band"><div class="ss-label">Veel mensen kiezen bijvoorbeeld voor</div><div class="ss-tegels">${tegels}</div></div>`);
            }
            if (gekozen === '4') {
                kop.insertAdjacentHTML('beforeend', `<aside class="ss-kaart"><div class="ss-label">Veel gekozen</div>${sessies.map(n => `<div class="ss-rij"><b>${n}</b><span>sessies</span></div>`).join('')}<p>${intake}</p></aside>`);
            }
            if (gekozen === '5') {
                copy.insertAdjacentHTML('beforeend', `<p>${intake}</p>`);
                kop.insertAdjacentHTML('beforeend', `<div class="ss-groot"><div class="ss-label">Veel mensen kiezen voor</div><div class="ss-cijfers">${sessies.map(n => `<b>${n}</b>`).join('<i>/</i>')}<span>sessies</span></div></div>`);
            }
        }

        // Keuzebalk weg na de keuze van Servé.
    });
})();
