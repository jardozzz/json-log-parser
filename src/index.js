const regstop = /Start[\s\S]+?"BetStop/g;
const reg = /"Date":.+?"BooksInfos":\[.+?}}}]}]/g;
const regBook = /"BooksInfos":\[.+?}}}]}]/g;
const regDate = /[0-9].+?[0-9]"/;
//const regdate = /"Date":.+?[0-9]"/;

let bookiesID = {
  1: 'pinnacle',
  6: 'fonbet',
  110: 'ggbet',
  17: 'parimatch',
  27: 'Olimp',
  79: 'Sportsbook',
  19: 'Unibet',
};
function parse(q) {
  const arrHolder = [];
  let j = q.match(reg).map((e) => {
    return [
      e.match(regDate)[0].slice(0, -1),
      JSON.parse('{' + e.match(regBook) + '}'),
    ];
  });
  console.log(j);
  j.forEach((element, index) => {
    element[1].BooksInfos[0].attached.forEach((e) => {
      let elem, arr;
      for (let i in e.odds) {
        if (
          arrHolder.find(
            (h) => h.market === e.market && h.period === e.period
          ) == undefined
        ) {
          arrHolder.push({ market: e.market, period: e.period, arr: [] });
        }
        arr = arrHolder.find(
          (h) => h.market === e.market && h.period === e.period
        ).arr;

        if (!arr[index]) {
          arr[index] = { date: '', bookies: [] };
        }

        if (!arr[index].bookies.some((e) => e.book === bookiesID[i])) {
          arr[index].bookies.push({ book: bookiesID[i] });
        }
        elem =
          arr[index].bookies[
            arr[index].bookies.findIndex((e) => e.book === bookiesID[i])
          ];
        elem.book = bookiesID[i];
        if (e.selectionId === 11 || e.selectionId === 1)
          elem.win1 = e.odds[i].odd;
        if (e.selectionId === 12 || e.selectionId === 2) {
          elem.win2 = e.odds[i].odd;
        }
        if (e.selectionId === 3) elem.draw = e.odds[i].odd;
        if (e.selectionId === 34 || e.selectionId === 7) {
          if (!elem.variants) elem.variants = [];
          console.log(elem.variants);
          if (
            !elem.variants.some(
              (h) => h.variant === `${-Number(e.variant)}` && h.hb === 'HB2'
            )
          ) {
            elem.variants.push({ variant: `${Number(e.variant)}`, hb: 'HB1' });
          }

          if (
            elem.variants.find(
              (h) => h.variant === `${Number(e.variant)}` && h.hb === 'HB1'
            ) === undefined
          ) {
            elem.variants.find(
              (h) => h.variant === `${-Number(e.variant)}` && h.hb === 'HB2'
            ).win1 = e.odds[i].odd;
          } else
            elem.variants.find(
              (h) => h.variant === `${Number(e.variant)}` && h.hb === 'HB1'
            ).win1 = e.odds[i].odd;
        }
        if (e.selectionId === 35 || e.selectionId === 8) {
          if (!elem.variants) elem.variants = [];
          if (
            !elem.variants.some(
              (h) => h.variant === `${-Number(e.variant)}` && h.hb === 'HB1'
            )
          ) {
            elem.variants.push({ variant: `${Number(e.variant)}`, hb: 'HB2' });
          }
          if (
            elem.variants.find(
              (h) => h.variant === `${Number(e.variant)}` && h.hb === 'HB2'
            ) === undefined
          ) {
            elem.variants.find(
              (h) => h.variant === `${-Number(e.variant)}` && h.hb === 'HB1'
            ).win2 = e.odds[i].odd;
          } else
            elem.variants.find(
              (h) => h.variant === `${Number(e.variant)}` && h.hb === 'HB2'
            ).win2 = e.odds[i].odd;
        }
        if (e.odds[i].operation === 'SUSPENDED') elem.status = 'SUSPENDED';
        arr[index].date = element[0];
      }
    });
  });
  console.log(arrHolder);
  return arrHolder;
}
const goButton = document.querySelector('.parser');
const str = document.getElementById('json');
goButton.addEventListener('click', () => {
  const container = document.querySelector('.buttoncontainer');
  container.innerHTML = '';
  const storage = document.querySelector('.market_container');
  storage.innerHTML = '';
  parse(str.value).forEach((e) => {
    let but = document.createElement('button');

    but.innerHTML = e.period + e.market;
    but.addEventListener('click', () => drawOdds(e));
    container.appendChild(but);
  });
});

function drawOdds(array) {
  const storage = document.querySelector('.market_container');
  storage.innerHTML = '';
  array.arr.forEach((e, n) => {
    const temp = document.querySelector('#container').content.cloneNode(true);
    temp.querySelector('.date').innerHTML = e.date;
    e.bookies.forEach((e) => {
      let innertexT = `${e.book}\n`;
      if (e.variants) {
        e.variants.forEach((hb) => {
          innertexT += `${hb.variant} ${hb.win1} ${hb.win2}\n`;
        });
      } else {
        innertexT += `${e.win1} ${e.draw || ''}  ${e.win2}\n `;
      }

      const bookmaker = document.createElement('span');
      bookmaker.innerText = innertexT;
      if (e.status === 'SUSPENDED') {
        bookmaker.classList.add('redborder');
      }
      temp.querySelector('.odds').appendChild(bookmaker);
    });
    storage.appendChild(temp);
  });
}
