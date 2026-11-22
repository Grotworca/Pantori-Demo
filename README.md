# Pantori - demo webowe

Trzy plansze 16 → 17 → 18, interfejs PL/EN/DE/FR/ES/IT, obsługa myszy, dotyku i klawiatury. Gra działa bez backendu, kont, bibliotek zewnętrznych i instalacji. Używa grafik dostarczonych przez autora oraz zasad instrukcji Pantori. Nie zawiera kart nagród, punktów ani akcji specjalnych.

## Uruchomienie

Rozpakuj archiwum i otwórz `index.html` w przeglądarce. Każde odświeżenie lub ponowne otwarcie gry rozpoczyna nową wyprawę z pustymi planszami. Gra nie zapisuje postępu w przeglądarce.

## GitHub Pages

1. Utwórz repozytorium na swoim GitHubie.
2. Wgraj zawartość tego katalogu do głównego katalogu repozytorium. Plik `index.html` ma być bezpośrednio w katalogu głównym, obok `app.js` i `assets/`.
3. W ustawieniach repozytorium w sekcji Pages wybierz publikację z gałęzi (`Deploy from a branch`), gałąź `main`, katalog `/ (root)` i zapisz.
4. Po zakończeniu publikacji otwórz adres podany przez GitHub Pages. Ten sam adres działa na PC i telefonie.

Plik `.nojekyll` pozwala serwować projekt jako zwykłe pliki statyczne. Wszystkie ścieżki są względne, więc gra działa też pod adresem repozytorium z podkatalogiem. Nie wymaga sekretów, tokenów ani płatnego serwera. Nie została automatycznie umieszczona na koncie GitHub.

## Sterowanie

- Wybierz klocek, następnie wskaż pole. Biały punkt na miniaturze to punkt zaczepienia.
- Obrót: prawy przycisk myszy (PPM) nad obszarem gry, spacja lub duży przycisk Obróć. Odbicie: przycisk Odbij lub klawisz F.
- Aby przenieść klocek, wybierz go na planszy lub w ekwipunku, następnie wskaż nowe pole.
- Ponowne wybranie aktywnego klocka lub Escape anuluje wybór.
- Delete zdejmuje zaznaczony klocek. Cofnij przywraca ostatnią zmianę, również zdjęcie klocka.
- Tab i Enter obsługują przyciski oraz pola planszy.
- Na telefonie ekwipunek pozostaje przy dolnej krawędzi ekranu.

## Zasady w demie

Wszystkie klocki wskazane na karcie muszą być użyte. Zakryj wszystkie owoce; nie zakrywaj murów; duch wymaga klocka tego samego koloru. Klocki tworzą jeden spójny obszar połączony bokami, dotykający krawędzi planszy. Każda para klocków może mieć najwyżej jeden wspólny bok. Kolce wymagają zakrytej przypisanej dźwigni. Diamenty: wszystkie lub żaden.

Gra blokuje kolizje z murem, duchem, innymi klockami i brzegiem już przy układaniu. Po każdym ułożeniu lub cofnięciu ruchu automatycznie sprawdza pełny układ i zalicza poprawnie rozwiązaną planszę. Klocki można układać w dowolnej kolejności. Nie ma przycisku sprawdzania ani wskazówek. Przycisk „Wyczyść wszystko” zdejmuje wszystkie klocki z bieżącej planszy; tę czynność można cofnąć. Przejście do kolejnej planszy wymaga poprawnego rozwiązania.

## Podmiana plansz

Edytuj `levels.js`. Tablica `PANTORI_LEVELS` określa kolejność etapów. Każdy wpis ma:

- `id`: unikalny numer mapy,
- `title`: tytuł wyświetlany w grze,
- `image`: ścieżka do grafiki samej siatki, bez nagłówka i panelu klocków,
- `size`: 8 dla obecnych map,
- `walls`, `fruits`, `diamonds`: listy współrzędnych `[kolumna, wiersz]`, licząc od zera od lewego górnego rogu,
- `ghosts`: `{at: [x,y], color: 'red'|'yellow'|'blue'|'green'}`,
- `spikes`: `{at: [x,y], lever: [x,y]}`,
- `pieces`: identyfikatory wymaganych klocków z `PANTORI_PIECES`.

Grafika i współrzędne muszą opisywać ten sam układ. Po zmianie map uruchom `node test.cjs`, aby potwierdzić rozwiązywalność i wygenerować przykładowe rozwiązania wyłącznie do testów. Solver testowy obsługuje obecne mapy 8×8. Przy zmianie rozmiaru zmień też jego pętle oraz siatkę i skalę w interfejsie. Przy powtarzaniu tego samego kształtu w jednej mapie nadaj kopiom oddzielne identyfikatory w definicjach. 

## Pliki i testy

- `index.html`, `style.css`: interfejs i responsywność.
- `app.js`: obsługa gry i stan przechowywany w pamięci do zamknięcia lub odświeżenia strony.
- `engine.js`: walidacja reguł.
- `levels.js`: mapy i kształty.
- `solutions.js`: przykładowe rozwiązania dla testów, nie jest ładowany przez grę.
- `test.cjs`: solver i testy reguł. Uruchomienie: `node test.cjs` (Node.js 18+).
- `assets/`: trzy oryginalne plansze PNG wycięte bez zmiany ilustracji z dostarczonego arkusza 1(3).png.

Postęp istnieje wyłącznie podczas bieżącego otwarcia strony. Po odświeżeniu rozpoczynasz od pierwszej, pustej planszy. Stary zapis poprzedniej wersji jest ignorowany i usuwany. Kod jest dostępny po stronie klienta, co jest zamierzone w darmowym demie.

Grafiki, nazwa i projekt gry: Radosław Ignatów. Publikacja repozytorium nie oznacza automatycznego udzielenia licencji na grę ani jej materiały.


## Zmiany interfejsu (wersja wielojęzyczna)

- Czarne tło i ciemne panele z czytelnymi przyciskami.
- Wybór języka u góry: lokalne flagi SVG, nazwy języków i pełne tłumaczenia interfejsu, zasad, błędów i zakończenia. Plik `i18n.js` zawiera słowniki.
- Przeglądarka może zapamiętać wyłącznie język (`pantori-language`). Układ klocków i postęp nadal nie są zapisywane.
- Przy przenoszeniu stare położenie wybranego klocka ma 50% dotychczasowej widoczności, łącznie z obrysem.
- Zamiast panelu celu wyprawy pozostaje przycisk Cofnij. Komunikaty o ruchach są pod obszarem gry.
- Mapy zachowują ilustracje dostarczonych kart. Pliki wyświetlane przeskalowano filtrem Lanczosa i wyostrzono filtrem Unsharp Mask. Rozmiar planszy na PC jest ograniczony, by nie rozciągać małego źródła nadmiernie. Nie są to odzyskane detale ani zamienione rysunki. Oryginalne wycinki są w `assets/original/`.

Dodatkowe testy: `node test-ui.cjs` sprawdza czyszczenie, cofanie, nowy start, przezroczystość, zachowanie układu przy zmianie języka, kompletność słowników i automatyczne zakończenie wszystkich etapów.

## Przewodnik startowy

Po uruchomieniu pojawia się przewodnik z sześcioma ekranami: cel gry, kontakt klocków, duchy, kolce, diamenty i sterowanie. Przykłady są pokazywane pojedynczo, z opisami na 2-3 zdania we wszystkich sześciu językach. Przyciski Dalej i Wstecz przełączają ekrany. Rozpocznij grę zamyka przewodnik startowy; po otwarciu zasad podczas gry pojawia się Wróć do gry, bez zmiany układu klocków. Język można zmienić również w przewodniku.

## Sterowanie dotykowe


## Odświeżony wygląd i precyzyjniejsze sterowanie

Kolorowe litery, pastelowe panele, grube kontury i przyciski przypominające elementy planszówki. Czarne tło i grafiki kart pozostają zachowane. Panel mobilny ma obrót, odbicie, zatwierdzenie, cofanie i czyszczenie pod ręką.

Podpowiedzi oraz opis sterowania w samouczku automatycznie dopasowują się do dotyku lub myszy we wszystkich sześciu językach. Na telefonie nie pokazują skrótów klawiaturowych.




## Poprawka: czarne obramowania poruszających się ikon

Ruchome duchy, owoce i diamenty są teraz wyświetlane z osobnych plików
PNG z przezroczystym tłem w `assets/sprites/`, zamiast używania filtra
SVG na fragmencie oryginalnej planszy. Dzięki temu nie przesuwają się
razem z nimi czarne fragmenty obramowań pól. Mapy i reguły nie zostały
zmienione. `icon-sprites.js` mapuje współrzędne ikon na ich pliki.

Przy aktualizacji GitHub Pages należy przesłać **cały** katalog projektu,
w tym nowy katalog `assets/sprites/` i `icon-sprites.js`.

## Interaktywny samouczek i przeciąganie

Samouczek ma 9 zadań: owoce, krawędź, obrót, odbicie, kontakt klocków, duchy, dźwignia i kolce, wszystkie diamenty, żaden diament. Przycisk Dalej odblokowuje się dopiero po rozwiązaniu ćwiczenia. Rozpocznij grę / Wróć do gry pozwala zakończyć samouczek. Zadania nie zmieniają stanu głównej gry.

Klocki można przeciągać ze zbioru bezpośrednio na mapę lub najpierw wybrać kliknięciem/dotknięciem. Puszczenie przeciąganego klocka zatwierdza prawidłową pozycję. Niedozwolony podgląd miga i pokazuje X na każdym segmencie; ruch nie jest zatwierdzany. Przy ograniczonym ruchu systemu X pozostaje widoczny bez migania. Przycisk Ustaw został usunięty. Na telefonie mapa bez wybranego klocka nadal pozwala przewijać stronę.

Nowe pliki wymagane do uruchomienia: `piece-drag.js`, `tutorial.js`, `interaction-i18n.js`. Wgraj całą zawartość paczki z nadpisaniem, zachowując folder assets.

Walidacja tej aktualizacji: `node test.cjs` oraz `node test-ui.cjs` (symulacja DOM i zdarzeń wskaźnika, 9 rozwiązywalnych ćwiczeń, blokada Dalej, brak zmian postępu, gesty myszy/dotyku, reguły i regresje duchów). Test pełnej przeglądarki nie został ukończony: środowisko blokuje uruchomienie Chromium. Brak testu na fizycznym telefonie.

Samouczek zaczyna się ekranem powitalnym z poprawną trasą na osobnej planszy. Dziewięć ćwiczeń zawiera murki. Zadanie z dźwignią ma jedno rozwiązanie, dwa owoce obok kolców i kropkowane połączenie. Duchy są opcjonalne; diamenty zbieramy parami albo pozostawiamy odkryte. `node test-tutorial.cjs` sprawdza wszystkie ustawienia i rozwiązywalność ćwiczeń.

Wersja 3: nowe układy i zestawy klocków w ćwiczeniach, przeredagowane teksty w sześciu językach oraz poprawione skalowanie wycinka grafiki kolców. Obrót i odbicie poprzedzają pozostałe mechaniki; diamenty zamykają samouczek.

Wersja 4: zadanie 2 pozwala zebrać owoc bez dojścia do krawędzi i wyświetla błąd; zadanie 5 pokazuje dwa graficzne przykłady błędnego styku. Zadanie 8 wymusza zebranie diamentów samym układem mapy. Zadanie 9 to dawny układ 8, dopuszczający zarówno 0, jak i wszystkie diamenty. Testy enumerują wszystkie rozwiązania i sprawdzają obie możliwości.
