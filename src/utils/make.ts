import { format } from './format';

/** TSV or CSV */
const sep = {
  win: '\t',
  mac: ',',
};

/**
 * String.prototype.replaceの第２引数
 * @param ｓ - ひらがな１文字
 * @returns - カタカナ１文字
 */
const replacer = (s: string) => String.fromCharCode(s.charCodeAt(0) + 0x60);

/**
 * 簡易的なdeepCopy
 * @param src - 辞書データオブジェクトリスト
 * @returns - JSONを利用してコピーした新しいリスト
 */
const deepCopy = <T = any[]>(src: any[]): T[] => {
  const result = JSON.parse(JSON.stringify(src));

  if (!Array.isArray(result)) {
    throw new Error('Object format is invalid.');
  }

  return result;
};

/**
 * ファイルの中身を作成します
 * @param src - 辞書データオブジェクト
 * @param type - 書き出すファイルのフォーマット
 * @returns - 辞書データとして書き出すテキスト
 */
export const make = (src: DFM.IME_Dictionary[], type: DFM.IME_Type) => {
  /** Copy the object as a new one  */
  const _src = deepCopy<DFM.IME_Dictionary>(src);
  const platform = type.startsWith('win') ? 'win' : 'mac';
  const data = _src
    .map((item) => {
      // GoogleIME用に読み仮名をカタカナに変換する
      if (type === 'win-google') {
        item.input = item.input?.replace(/[ぁ-ん]/g, replacer);
      }

      if (!item.input || !item.output) {
        return null;
      }

      const list: DFM.Format = format(item, platform);

      return list.join(sep[platform]);
    })
    .filter(Boolean);

  switch (type) {
    case 'win-google':
      return data.join('\r\n');

    case 'win':
      return Buffer.from(`\ufeff${data.join('\n')}`, 'utf16le');

    default:
      return data.join('\n');
  }
};
