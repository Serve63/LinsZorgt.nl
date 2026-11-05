// Alleen voor lokaal kiezen: vijf overgangen van het contactblok naar de footer.
(function () {
    const opties = { 1: 'Zacht vervagen', 2: 'Schuine rand', 3: 'Roze lijn', 4: 'Bewegende balk', 5: 'Grote naam' };
    const params = new URLSearchParams(location.search);
    const gekozen = opties[params.get('ft')] ? params.get('ft') : '3'; // gekozen: Roze lijn (05-11)

    window.addEventListener('DOMContentLoaded', () => {
        // Losse fix: "Waarmee kan<br>ik" wordt één regel met spatie
        document.querySelectorAll('#faq .faq-header h2 br').forEach(br => br.replaceWith(' '));

        const footer = document.querySelector('footer');
        if (footer && gekozen !== '0') {
            document.body.classList.add('ft-' + gekozen);
            if (gekozen === '4') {
                const band = document.querySelector('.ho-band--marquee');
                if (band) footer.insertAdjacentElement('beforebegin', band.cloneNode(true));
            }
            if (gekozen === '5') {
                footer.insertAdjacentHTML('afterbegin', '<div class="ft-naam" aria-hidden="true">LinsZorgT</div>');
            }
        }

        // Keuzebalk weg na de keuze van Servé.
    });
})();
