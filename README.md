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
- Pięć GIF-ów zasad, w tym nowy przykład dopasowania koloru ducha: przed/po ułożeniu, kontakt klocków, kolce z dźwignią, diamenty. Bazują na przykładach dostarczonej instrukcji; przykład kolców używa konfiguracji z instrukcji na grafice aktualnej karty, z przezroczystym zakryciem, aby mechanizm był czytelny. Mają symbol poprawności i numer kroku. Opisy są tłumaczone. Animacje można zatrzymać; preferencja ograniczonego ruchu systemu domyślnie je zatrzymuje.
- Mapy zachowują ilustracje dostarczonych kart. Pliki wyświetlane przeskalowano filtrem Lanczosa i wyostrzono filtrem Unsharp Mask. Rozmiar planszy na PC jest ograniczony, by nie rozciągać małego źródła nadmiernie. Nie są to odzyskane detale ani zamienione rysunki. Oryginalne wycinki są w `assets/original/`.

Dodatkowe testy: `node test-ui.cjs` sprawdza czyszczenie, cofanie, nowy start, przezroczystość, zachowanie układu przy zmianie języka, kompletność słowników i automatyczne zakończenie wszystkich etapów.

## Przewodnik startowy

Po uruchomieniu pojawia się przewodnik z sześcioma ekranami: cel gry, kontakt klocków, duchy, kolce, diamenty i sterowanie. Przykłady są pokazywane pojedynczo, z opisami na 2-3 zdania we wszystkich sześciu językach. Przyciski Dalej i Wstecz przełączają ekrany. Rozpocznij grę zamyka przewodnik startowy; po otwarciu zasad podczas gry pojawia się Wróć do gry, bez zmiany układu klocków. Język można zmienić również w przewodniku.

## Sterowanie dotykowe

Wybierz klocek i przesuwaj palcem po planszy, aby przesuwać jego kontur. Puszczenie palca nie zatwierdza ruchu. Obrót i odbicie działają w podglądzie; osobne stuknięcie pola zatwierdza pozycję. Stuknięcie ustawionego klocka wybiera go do przeniesienia. Przewijaj stronę poza planszą. Pierwszy GIF samouczka przedstawia aktualną mapę 16 i poprawne rozwiązanie.
