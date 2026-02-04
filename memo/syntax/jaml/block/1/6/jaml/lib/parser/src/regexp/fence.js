export const FenceRegExp = {
    // Tokenizerでインライン競合判定を行うため、ここでは単純なパターン定義
    START: /^([!"#$%&'\-^~@+*`<>?/\\]{3,})(.*)$/,
};
