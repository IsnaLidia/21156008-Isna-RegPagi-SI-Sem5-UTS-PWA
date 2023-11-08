document.addEventListener('DOMContentLoaded', function () {
    // Buat atau buka database IndexedDB
    const dbName = 'komentarDB';
    const dbVersion = 1;
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('comments', { autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('comment', 'comment', { unique: false });
    };

    request.onerror = function (event) {
        console.error('Error opening database: ' + event.target.errorCode);
    };

    request.onsuccess = function (event) {
        const db = event.target.result;

        // Tangani submit form komentar
        document.getElementById('comment-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const comment = document.getElementById('comment').value;

            // Mulai transaksi
            const transaction = db.transaction(['comments'], 'readwrite');
            const objectStore = transaction.objectStore('comments');

            const newComment = {
                name: name,
                comment: comment
            };

            // Tambahkan komentar ke IndexedDB
            const addRequest = objectStore.add(newComment);

            addRequest.onsuccess = function () {
                console.log('Komentar berhasil ditambahkan ke IndexedDB.');
                document.getElementById('name').value = '';
                document.getElementById('comment').value = '';
                fetchComments();
            };

            addRequest.onerror = function (event) {
                console.error('Error adding comment: ' + event.target.errorCode);
            };
        });

        // Fungsi untuk mengambil dan menampilkan komentar dari IndexedDB
        function fetchComments() {
            const transaction = db.transaction(['comments'], 'readonly');
            const objectStore = transaction.objectStore('comments');

            const commentsList = document.getElementById('name');
            commentsList.innerHTML = '';

            const request = objectStore.openCursor();
            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const comment = document.createElement('div');
                    comment.textContent = cursor.value.name + ': ' + cursor.value.comment;
                    commentsList.appendChild(comment);
                    cursor.continue();
                }
            };
        }

        fetchComments();
    };
});
