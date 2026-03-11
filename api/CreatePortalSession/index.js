module.exports = async function(context) { context.res = { status: 410, body: { error: "Deprecated" } }; };
