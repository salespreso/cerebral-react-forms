export default function(page) {
	function setPage(input, state) {
		state.merge({ page });
	}

	return setPage;
}
