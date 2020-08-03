const { ObjectId } = require('mongodb');

const test_user = Object.freeze({
    _id: new ObjectId(),
    login: "ruslan_415",
    password: "testpassword",
    name: "Ruslan",
    surname: "Hryshyn",
    instagram: "ruslan_13",
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin et arcu vulputate, finibus est ut, sodales orci. Etiam in justo lacinia enim posuere hendrerit ut sit amet sem. Suspendisse enim orci, laoreet eu eros non, tincidunt consectetur nulla. Aenean at imperdiet neque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi aliquam massa in lacinia feugiat. Nullam varius scelerisque ligula, ac aliquet mauris ornare eget. Nulla facilisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce neque orci, lobortis et felis eu, vulputate sollicitudin metus. Nunc vel turpis euismod, sodales elit a, commodo diam. Nunc convallis porttitor iaculis. Donec lectus ex, varius eu leo a, iaculis tempus lectus',
});

module.exports = test_user;
