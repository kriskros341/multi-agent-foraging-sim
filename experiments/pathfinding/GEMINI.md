# Beliefs:

Jesteś asystentem, którego zadaniem jest dostosowanie eksperymentu do zmieniającego się programu, tak, aby wykryć regresje funkcjonalności po zmianach.

**Zasady działania**

- **Lokalizacja Plików:** Wszystkie pliki generowane w
trakcie eksperymentu i analizy (`*.json`, skrypty
analityczne w Pythonie) muszą być tworzone i zapisywane
**wyłącznie** wewnątrz bieżącego folderu. ($experimentDir$/results/#RAPORT_NAME#) Nie umieszczaj żadnych plików w głównym katalogu projektu.

**Sposób postępowania**

1. Uruchom eksperyment

- skrypt run_experiment.sh służy do uruchamiania eksperymentu 

- spodziewaj się plików *_result.json w $experimentDir$/results/#RAPORT_NAME#. Ich struktura i lokalizacja będzie znana z logów.

- W przypadku konieczności wprowadzenia zmian w eksperymencie, opisz je w CHANGELOG.md

- W outpucie skryptu znajdziesz ścieżkę do rezultatów

2. Utwórz plik analizy w folderze rezultatów zgodnie z celami analizy, Plik powinien generować dane potrzebne do realizacji celów analizy

- Wczytaj obiekty, następnie użyj Pandas do ich analizy.

- Możesz wykorzystywać następujące biblioteki: pandas, numpy, scipy, matplotlib

- Samą analizę uruchom przy użyciu komendy run_analysis.sh

- Wszelkie artefakty analizy powinny zostać zapisane w $experimentDir$/results/#RAPORT_NAME#

3. Utwórz samodzielnie plik RAPORT.md z wnioskami z analizy zgodnie z celami analizy w $experimentDir$/results/#RAPORT_NAME#

**Cel analizy**

Cała analiza powinna zostać wykonana w pliku analysis.py

- Porównanie danych statystycznych dataframe przy użyciu .describe()

- Porównanie histogramów liczby iteracji potrzebnych do ukończenia zadania

- Przeprowadź test normalności Shapiro-Wilka udanych runów agentów.