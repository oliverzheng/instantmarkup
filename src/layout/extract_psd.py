import sys, json
from psd_tools import PSDImage
from psd_tools import Group as PSDGroup

def get_layers(layers):
	array = []
	for layer in layers:
		if not layer.visible:
			continue
		if layer._info.clipping == 1:
			continue

		obj = {
			'id': layer.layer_id,
			'name': layer.name
		}

		if not isinstance(layer, PSDGroup):
			obj['bbox'] = {
				'x': layer.bbox.x1,
				'y': layer.bbox.y1,
				'w': layer.bbox.width,
				'h': layer.bbox.height
			}

			if layer.text_data:
				obj['text'] = {
					'value': layer.text_data.text
				}
		else:
			obj['children'] = get_layers(layer.layers)

		array.append(obj)

	return array


def get_source(psd):
	obj = {
		'bbox': {
			'w': psd.header.width,
			'h': psd.header.height
		},
		'children': get_layers(psd.layers)
	}
	return obj


filename = sys.argv[1]
psd = PSDImage.load(filename)

source = get_source(psd)

print json.dumps(source, sort_keys=True, indent=4)
