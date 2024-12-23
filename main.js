const Apify = require('apify');
const { parse } = require('csv-parse/sync');

Apify.main(async () => {
    const input = await Apify.getInput();
    if (!input || !input.toString) {
        throw new Error('Input must be a Buffer or string representing CSV data.');
    }

    try {
      const records = parse(input.toString(), {
        columns: false,
        skip_empty_lines: true,
        trim: true,
        quote: '"',
        escape: '"',
      });

      let ankiDeck = "";
      records.forEach((record) => {
        if (record.length !== 2) {
            console.warn(`Invalid row: ${record}. Skipping.`);
            return;
        }
        const front = record[0];
        const back = record[1].replace(/\n/g, '<br>'); // Replace \n with <br>
        ankiDeck += `${front}\t${back}\n`;
    });

        const kvs = await Apify.openKeyValueStore();
        await kvs.setValue('ankiDeck.txt', ankiDeck, { contentType: 'text/plain; charset=utf-8' });

        const url = await Apify.utils.createSignedUrl({
            keyName: 'ankiDeck.txt',
            contentType: 'text/plain; charset=utf-8',
            expiresInSecs: 3600,
        });

        console.log(`Anki deck available at: ${url}`);

    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw new Error('Invalid CSV format. Please check your file.');
    }
});
