-- ============================================================
-- SEED DATA — Veldheer Europe 2026
-- ============================================================

DO $$
DECLARE
  v_trip_id      uuid;

  -- Members
  v_jared        uuid;
  v_morgan       uuid;
  v_aaron        uuid;
  v_jodi         uuid;
  v_eden         uuid;
  v_edwin        uuid;
  v_eva          uuid;
  v_lennox       uuid;
  v_james        uuid;
  v_beau         uuid;

  -- Trip days
  v_day1         uuid;
  v_day2         uuid;
  v_day3         uuid;
  v_day4         uuid;
  v_day5         uuid;
  v_day6         uuid;
  v_day7         uuid;
  v_day8         uuid;
  v_day9         uuid;
  v_day10        uuid;
  v_day11        uuid;
  v_day12        uuid;
  v_day13        uuid;

BEGIN

  -- ----------------------------------------------------------
  -- TRIP
  -- ----------------------------------------------------------

  INSERT INTO trips (code, name, start_date, end_date)
  VALUES ('veldheer2026', 'Veldheer Europe 2026', '2026-04-03', '2026-04-15')
  RETURNING id INTO v_trip_id;

  -- ----------------------------------------------------------
  -- MEMBERS
  -- ----------------------------------------------------------

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Jared',    '👨',    false, 1) RETURNING id INTO v_jared;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Morgan',   '👩',    false, 2) RETURNING id INTO v_morgan;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Aaron',    '🧔',    false, 3) RETURNING id INTO v_aaron;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Jodi',     '👩‍🦰',   false, 4) RETURNING id INTO v_jodi;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Eden',     '👧',    true,  5) RETURNING id INTO v_eden;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Edwin II', '👦',    true,  6) RETURNING id INTO v_edwin;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Eva',      '🧒',    true,  7) RETURNING id INTO v_eva;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Lennox',   '👶',    true,  8) RETURNING id INTO v_lennox;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'James',    '🧒',    true,  9) RETURNING id INTO v_james;

  INSERT INTO members (trip_id, name, emoji, is_kid, sort_order)
  VALUES (v_trip_id, 'Beau',     '👶',    true,  10) RETURNING id INTO v_beau;

  -- ----------------------------------------------------------
  -- TRIP DAYS
  -- ----------------------------------------------------------

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-03', 'Paris',         'Arrival in Paris',      1) RETURNING id INTO v_day1;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-04', 'Paris',         'Paris Day 1',           2) RETURNING id INTO v_day2;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-05', 'Paris',         'Paris Day 2',           3) RETURNING id INTO v_day3;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-06', 'Paris',         'Paris Day 3',           4) RETURNING id INTO v_day4;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-07', 'Paris',         'Paris Day 4',           5) RETURNING id INTO v_day5;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-08', 'Paris',         'Paris Day 5',           6) RETURNING id INTO v_day6;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-09', 'Paris',         'Paris Day 6',           7) RETURNING id INTO v_day7;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-10', 'Saint-Raphael', 'Travel to the Coast',   8) RETURNING id INTO v_day8;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-11', 'Saint-Raphael', 'Riviera Day 1',         9) RETURNING id INTO v_day9;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-12', 'Saint-Raphael', 'Riviera Day 2',         10) RETURNING id INTO v_day10;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-13', 'Lisbon',        'Travel to Lisbon',      11) RETURNING id INTO v_day11;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-14', 'Lisbon',        'Lisbon Day 1',          12) RETURNING id INTO v_day12;

  INSERT INTO trip_days (trip_id, date, city, title, day_number)
  VALUES (v_trip_id, '2026-04-15', 'Lisbon',        'Departure Day',         13) RETURNING id INTO v_day13;

  -- ----------------------------------------------------------
  -- ITINERARY ITEMS
  -- ----------------------------------------------------------

  -- DAY 1 — Arrival in Paris (Apr 3)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, notes, sort_order)
  VALUES
    (v_day1, v_trip_id,
     'Flight arrives CDG — Terminal 2E',
     'flight',
     '2026-04-03 08:45:00+02', '2026-04-03 08:45:00+02',
     'Charles de Gaulle Airport', 'Aéroport CDG, 95700 Roissy-en-France, France',
     49.0097, 2.5479,
     'Baggage claim Hall B. Look for airport taxi rank outside arrivals.',
     1),

    (v_day1, v_trip_id,
     'Check in — Citadines Apart''hotel Republique Paris',
     'hotel',
     '2026-04-03 15:00:00+02', NULL,
     'Citadines Republique Paris', '16 Rue Sambre-et-Meuse, 75010 Paris, France',
     48.8694, 2.3694,
     'Early bag drop available if rooms not ready. Ask for cribs at front desk.',
     2),

    (v_day1, v_trip_id,
     'Welcome dinner — Brasserie Lipp',
     'restaurant',
     '2026-04-03 19:30:00+02', '2026-04-03 21:30:00+02',
     'Brasserie Lipp', '151 Boulevard Saint-Germain, 75006 Paris, France',
     48.8539, 2.3330,
     'Reservation under Veldheer, party of 10.',
     3);

  -- DAY 2 — Paris Day 1 (Apr 4) — Eiffel Tower
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, url, notes, sort_order)
  VALUES
    (v_day2, v_trip_id,
     'Eiffel Tower — Summit Visit',
     'activity',
     '2026-04-04 09:00:00+02', '2026-04-04 12:00:00+02',
     'Tour Eiffel', 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
     48.8584, 2.2945,
     'BOOK-ET-8842',
     'https://www.toureiffel.paris/en',
     'Pre-booked summit tickets. Meet at south pillar entrance. Kids under 4 free.',
     1),

    (v_day2, v_trip_id,
     'Lunch — Cafe du Marche',
     'restaurant',
     '2026-04-04 12:30:00+02', '2026-04-04 14:00:00+02',
     'Cafe du Marche', '38 Rue Cler, 75007 Paris, France',
     48.8563, 2.3042,
     NULL, NULL,
     'Casual bistro on the Rue Cler market street. Great for kids.',
     2),

    (v_day2, v_trip_id,
     'Champ de Mars picnic & play',
     'activity',
     '2026-04-04 14:00:00+02', '2026-04-04 17:00:00+02',
     'Champ de Mars', 'Champ de Mars, 75007 Paris, France',
     48.8556, 2.2986,
     NULL, NULL,
     'Grab pastries from a nearby bakery. Kids can run free on the lawns.',
     3),

    (v_day2, v_trip_id,
     'Seine River Cruise — Bateaux Mouches',
     'activity',
     '2026-04-04 17:30:00+02', '2026-04-04 18:45:00+02',
     'Bateaux Mouches', 'Port de la Conference, 75008 Paris, France',
     48.8634, 2.3068,
     'BM-2026-443',
     'https://www.bateaux-mouches.fr',
     '1-hour sightseeing cruise. Boarding 10 min before departure.',
     4);

  -- DAY 3 — Paris Day 2 (Apr 5) — Louvre & Marais
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, url, notes, sort_order)
  VALUES
    (v_day3, v_trip_id,
     'Louvre Museum',
     'activity',
     '2026-04-05 09:00:00+02', '2026-04-05 13:00:00+02',
     'Musee du Louvre', 'Rue de Rivoli, 75001 Paris, France',
     48.8606, 2.3376,
     'LVR-9921-VE',
     'https://www.louvre.fr/en',
     'Timed entry tickets. Focus: Egyptian Antiquities, Venus de Milo, Mona Lisa. Strollers allowed.',
     1),

    (v_day3, v_trip_id,
     'Lunch — L''As du Fallafel (Le Marais)',
     'restaurant',
     '2026-04-05 13:30:00+02', '2026-04-05 14:30:00+02',
     'L''As du Fallafel', '34 Rue des Rosiers, 75004 Paris, France',
     48.8551, 2.3533,
     NULL, NULL,
     'Famous falafel shop in the Jewish Quarter. Expect a short queue — worth it.',
     2),

    (v_day3, v_trip_id,
     'Place des Vosges & Marais stroll',
     'activity',
     '2026-04-05 15:00:00+02', '2026-04-05 17:30:00+02',
     'Place des Vosges', 'Place des Vosges, 75004 Paris, France',
     48.8555, 2.3625,
     NULL, NULL,
     'Oldest planned square in Paris. Kids can play under the arcades.',
     3);

  -- DAY 5 — Paris Day 4 (Apr 7) — Versailles day trip
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, url, notes, sort_order)
  VALUES
    (v_day5, v_trip_id,
     'Palace of Versailles',
     'activity',
     '2026-04-07 09:30:00+02', '2026-04-07 16:00:00+02',
     'Chateau de Versailles', 'Place d''Armes, 78000 Versailles, France',
     48.8049, 2.1204,
     'VER-7733-VE',
     'https://en.chateauversailles.fr',
     'Take RER C from Paris-Austerlitz (approx 40 min). Passport ticket includes palace + gardens.',
     1),

    (v_day5, v_trip_id,
     'Lunch in the Versailles Gardens',
     'restaurant',
     '2026-04-07 13:00:00+02', '2026-04-07 14:00:00+02',
     'La Flotille (Versailles Gardens)', 'Parc du Chateau de Versailles, 78000 Versailles, France',
     48.8071, 2.1128,
     NULL, NULL,
     'Restaurant inside the gardens near the Grand Canal. Reserve or arrive early.',
     2);

  -- DAY 8 — Travel to Saint-Raphael (Apr 10)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, notes, sort_order)
  VALUES
    (v_day8, v_trip_id,
     'TGV Paris Gare de Lyon → Saint-Raphael-Valescure',
     'transport',
     '2026-04-10 08:10:00+02', '2026-04-10 11:42:00+02',
     'Gare de Lyon', 'Place Louis-Armand, 75012 Paris, France',
     48.8448, 2.3735,
     'SNCF-TGV-6612',
     'Train 6173. Car 14, seats 41-54 (reserved). Luggage storage at head of car.',
     1),

    (v_day8, v_trip_id,
     'Check in — Villa Douce, Saint-Raphael',
     'hotel',
     '2026-04-10 14:00:00+02', NULL,
     'Villa Douce', '47 Boulevard du General de Gaulle, 83700 Saint-Raphael, France',
     43.4248, 6.7680,
     NULL,
     'Private villa rental. Key lockbox code sent via email. Private pool.',
     2),

    (v_day8, v_trip_id,
     'Sunset aperitivo at the port',
     'activity',
     '2026-04-10 18:30:00+02', '2026-04-10 20:00:00+02',
     'Vieux Port de Saint-Raphael', 'Quai Albert 1er, 83700 Saint-Raphael, France',
     43.4254, 6.7672,
     NULL,
     'Walk to the old port for drinks and the sunset over the Mediterranean.',
     3);

  -- DAY 9 — Riviera Day 1 (Apr 11)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, url, notes, sort_order)
  VALUES
    (v_day9, v_trip_id,
     'Plage du Veillat — beach morning',
     'activity',
     '2026-04-11 09:30:00+02', '2026-04-11 13:00:00+02',
     'Plage du Veillat', 'Boulevard de la Liberation, 83700 Saint-Raphael, France',
     43.4221, 6.7701,
     NULL,
     'Main public beach. Calm water, good for kids. Bring snacks and sunscreen.',
     1),

    (v_day9, v_trip_id,
     'Lunch — Le Lamparo',
     'restaurant',
     '2026-04-11 13:00:00+02', '2026-04-11 14:30:00+02',
     'Le Lamparo', '100 Rue de la Garonne, 83700 Saint-Raphael, France',
     43.4236, 6.7663,
     NULL,
     'Seafood restaurant near the port. Great bouillabaisse.',
     2),

    (v_day9, v_trip_id,
     'Day trip to Iles de Lerins (Cannes)',
     'activity',
     '2026-04-11 15:30:00+02', '2026-04-11 19:00:00+02',
     'Iles de Lerins', 'Ile Saint-Honorat, 06400 Cannes, France',
     43.5067, 7.0452,
     'https://www.trans-cote-azur.com',
     'Ferry from Saint-Raphael to Iles de Lerins. Snorkeling, hiking, monastery visit.',
     3);

  -- DAY 11 — Travel to Lisbon (Apr 13)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, notes, sort_order)
  VALUES
    (v_day11, v_trip_id,
     'Flight Nice → Lisbon (TAP Air Portugal)',
     'flight',
     '2026-04-13 10:05:00+02', '2026-04-13 12:20:00+01',
     'Nice Cote d''Azur Airport', '06281 Nice, France',
     43.6584, 7.2158,
     'TAP-TP421-VE',
     'Check-in opens 2h before. Terminal 2. Transfer by shuttle from Saint-Raphael to Nice airport departs 07:15.',
     1),

    (v_day11, v_trip_id,
     'Check in — Bairro Alto Hotel, Lisbon',
     'hotel',
     '2026-04-13 15:00:00+01', NULL,
     'Bairro Alto Hotel', 'Praca Luis de Camoes 2, 1200-243 Lisbon, Portugal',
     38.7126, -9.1424,
     NULL,
     'Boutique hotel in Chiado. Connecting rooms reserved. Rooftop bar has views over the city.',
     2),

    (v_day11, v_trip_id,
     'Dinner — Taberna da Rua das Flores',
     'restaurant',
     '2026-04-13 19:30:00+01', '2026-04-13 21:30:00+01',
     'Taberna da Rua das Flores', 'Rua das Flores 103, 1200-195 Lisbon, Portugal',
     38.7115, -9.1403,
     NULL,
     'Traditional petiscos (Portuguese tapas). Walk from hotel — 5 min.',
     3);

  -- DAY 12 — Lisbon Day 1 (Apr 14)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, url, notes, sort_order)
  VALUES
    (v_day12, v_trip_id,
     'Belem Tower & Jeronimos Monastery',
     'activity',
     '2026-04-14 09:30:00+01', '2026-04-14 12:30:00+01',
     'Torre de Belem', 'Av. Brasilia, 1400-038 Lisbon, Portugal',
     38.6916, -9.2159,
     'BEL-LX-331',
     'https://www.torrebelem.gov.pt',
     'UNESCO World Heritage sites. Tram 15E from Praca da Figueira to Belem (~25 min).',
     1),

    (v_day12, v_trip_id,
     'Pastel de Nata tasting — Pasteis de Belem',
     'activity',
     '2026-04-14 12:30:00+01', '2026-04-14 13:15:00+01',
     'Pasteis de Belem', 'Rua de Belem 84-92, 1300-085 Lisbon, Portugal',
     38.6972, -9.2036,
     NULL,
     'https://www.pasteisdebelem.pt',
     'The original custard tart bakery since 1837. Must-do. Order several rounds.',
     2),

    (v_day12, v_trip_id,
     'Alfama & Sao Jorge Castle',
     'activity',
     '2026-04-14 15:00:00+01', '2026-04-14 17:30:00+01',
     'Castelo de Sao Jorge', 'R. de Santa Cruz do Castelo, 1100-129 Lisbon, Portugal',
     38.7139, -9.1336,
     NULL,
     'https://castelodesaojorge.pt',
     'Moorish hilltop castle with panoramic views. Comfortable shoes a must. Stroller-accessible main areas.',
     3),

    (v_day12, v_trip_id,
     'Farewell dinner — Solar dos Presuntos',
     'restaurant',
     '2026-04-14 20:00:00+01', '2026-04-14 22:30:00+01',
     'Solar dos Presuntos', 'Rua das Portas de Santo Antao 150, 1150-269 Lisbon, Portugal',
     38.7165, -9.1400,
     NULL,
     NULL,
     'Classic Lisbon restaurant. Bacalhau and grilled fish specialties. Final group dinner — celebrate!',
     4);

  -- DAY 13 — Departure Day (Apr 15)
  INSERT INTO itinerary_items
    (trip_day_id, trip_id, title, category, start_time, end_time,
     location_name, address, lat, lng, booking_ref, notes, sort_order)
  VALUES
    (v_day13, v_trip_id,
     'Flight Lisbon → Home (TAP Air Portugal)',
     'flight',
     '2026-04-15 13:45:00+01', NULL,
     'Lisbon Humberto Delgado Airport', 'Alameda das Comunidades Portuguesas, 1749-078 Lisbon, Portugal',
     38.7742, -9.1342,
     'TAP-TP220-VE',
     'Check-in closes 60 min before. Terminal 1. Allow 45 min from hotel by taxi.',
     1);

END $$;
