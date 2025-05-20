DROP TYPE IF EXISTS categorie_cocktail;
DROP TYPE IF EXISTS stil_servire;
DROP TYPE IF EXISTS baza_alcoolica;

CREATE TYPE categorie_cocktail AS ENUM( 'clasic', 'răcoritor', 'îndulcit', 'non-alcoolic', 'tropical', 'de_petreceri');
CREATE TYPE stil_servire AS ENUM('cu gheata', 'fara gheata', 'sec', 'shot', 'scurt', 'in straturi', 'frozen', 'lung');
CREATE TYPE baza_alcoolica AS ENUM('rom', 'vodca', 'gin', 'lichior', 'whisky', 'tequila', 'mix', 'fără alcool');

CREATE TABLE IF NOT EXISTS COCKTAILS(
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   timp_prep_min INT NOT NULL CHECK (timp_prep_min >= 0),
   volum_ml INT NOT NULL CHECK (volum_ml >= 0),
   categorie categorie_cocktail DEFAULT 'clasic',
   tarie_alcoolica NUMERIC(4,1) CHECK (tarie_alcoolica >= 0),
   stil stil_servire DEFAULT 'fara gheata',
   baza baza_alcoolica DEFAULT 'mix',
   ingrediente VARCHAR [],
   contine_alcool BOOLEAN NOT NULL DEFAULT TRUE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE COCKTAILS
ADD COLUMN vegan BOOLEAN NOT NULL DEFAULT FALSE;

INSERT into COCKTAILS (
  nume, descriere, timp_prep_min, volum_ml, categorie, tarie_alcoolica,
  stil, baza, ingrediente, contine_alcool, vegan, imagine
) VALUES 
('Mojito', 'Cocktail cu mentă și lime, perfect pentru zilele calde.', 5, 250, 'răcoritor', 8.0, 'lung', 
  'rom', '{"rom alb", "menta", "lime", "zahar", "apa minerala", "gheata"}', true, true, 'mojito.jpg'),

('Piña Colada', 'Băutură exotică dulce și cremoasă.', 6, 300, 'tropical', 12.5, 'frozen', 
  'rom', '{"rom alb", "cremă de cocos", "suc de ananas", "gheață zdrobită"}', true, false, 'pina_colada.jpg'),

('Negroni', 'Cocktail clasic italian, amar și complex.', 3, 120, 'clasic', 22.0, 'scurt', 'gin', 
  '{"gin", "vermut roșu", "Campari", "coajă de portocală"}', true, false, 'negroni.jpg'),

('Gin Tonic', 'Combinație simplă și elegantă, răcoritoare, cu apă tonică.', 2, 250, 'răcoritor', 10.5, 'lung', 'gin', 
  '{"gin", "apă tonică", "lime", "gheață"}', true, true, 'gin_tonic.jpg'),

('Strawberry Daiquiri', 'Cocktail fructat și înghețat, perfect pentru vară.', 7, 300, 'tropical', 9.0, 'frozen', 'rom', 
  '{"rom alb", "căpșuni", "suc lime", "sirop zahăr", "gheață zdrobită"}', true, true, 'strawberry_daiquiri.jpg'),

('Margarita', 'Băutură clasică mexicană, echilibru între acru și sărat.', 4, 150, 'clasic', 18.0, 'scurt', 'tequila', 
  '{"tequila", "triplu sec", "suc lime", "sare"}', true, true, 'margarita.jpg'),

('Blue Lagoon', 'Cocktail vibrant albastru, cu gust fructat și prospețime.', 3, 250, 'tropical', 11.0, 'lung', 'vodca', 
  '{"vodcă", "blue curaçao", "limonadă", "gheață"}', true, true, 'blue_lagoon.jpg'),

('Tequila Sunrise', 'Cocktail colorat și dulce, inspirat de un răsărit tropical.', 4, 200, 'tropical', 13.0, 'lung', 'tequila', 
  '{"tequila", "suc de portocale", "grenadină"}', true, true, 'tequila_sunrise.jpg'),

('Cosmopolitan', 'Elegant și ușor acrișor, potrivit pentru o seară sofisticată.', 3, 130, 'clasic', 16.0, 'fara gheata', 'vodca', 
  '{"vodcă", "triplu sec", "suc de merișor", "lime"}', true, true, 'cosmopolitan.jpg'),

('Mai Tai', 'Cocktail exotic, complex, pe bază de rom și migdale.', 5, 180, 'tropical', 17.5, 'scurt', 'rom', 
  '{"rom închis", "rom alb", "lime", "orgeat", "triplu sec"}', true, true, 'mai_tai.jpg'),

('Whisky Sour', 'Cocktail echilibrat, acrișor și corpolent, cu whisky.', 4, 150, 'clasic', 19.0, 'scurt', 'whisky', 
  '{"whisky", "suc lime", "sirop simplu", "albuș opțional"}', true, false, 'whisky_sour.jpg'),

('Sex on the Beach', 'Băutură fructată, populară în cluburi și petreceri.', 3, 250, 'tropical', 10.0, 'lung', 'vodca', 
  '{"vodcă", "piersici", "suc de portocales", "merișor"}', true, true, 'sex_on_the_beach.jpg'),

('B52', 'Shot stratificat cu trei lichioruri, perfect ca desert lichid.', 2, 60, 'de_petreceri', 26.0, 'in straturi', 'mix', 
  '{"lichior cafea", "Baileys", "Grand Marnier"}', true, false, 'b52.jpg'), 

('Limonadă cu mentă', 'Băutură răcoritoare, fără alcool, perfectă pentru vară.', 4, 300, 'non-alcoolic', 0.0, 'lung', 'fără alcool', 
  '{"lămâie", "mentă", "zahăr", "apă plată sau minerală", "gheață"}', false, true, 'limonada_menta.jpg'),

('Virgin Mojito', 'Versiune fără alcool a clasicului Mojito, răcoritoare și fresh.', 4, 300, 'non-alcoolic', 0.0, 'lung', 'fără alcool', 
  '{"mentă", "lime", "zahăr", "apă minerală", "gheață"}', false, true, 'virgin_moito.jpg');