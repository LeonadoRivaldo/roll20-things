on('change:graphic', function (obj) {
	const HP = obj.get('bar1_value');
	const MAX_HP = obj.get('bar1_max');

	if (MAX_HP === '') {
		return;
	}

	//dead
	if (HP <= 0) {
		obj.set({
			status_dead: true,
			status_redmarker: false,
		});
		return;
	}

	//bloodie
	if (HP <= MAX_HP / 2) {
		obj.set({
			status_redmarker: true,
		});

		return;
	}

	obj.set({
		status_redmarker: false,
		status_dead: false,
	});
});
